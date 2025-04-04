const prisma = require("../utils/PrismaInit")

async function handleUserSession(io, socket, ConnectedUsers) {
    try {
        if (ConnectedUsers.has(socket.userId)) {
            const existingUser = ConnectedUsers.get(socket.userId)
            io.to(existingUser.socketId).emit('session-closed', {
                message: "Connection closed.Login for different broswer detected",
                exitConnection: true
            })
            const existingSocket = io.sockets.sockets.get(existingUser.socketId);
            if (existingSocket) {
                existingSocket.disconnect(true);
            }
            console.log(`User ${socket.userId} reconnected. Old session (${existingUser.socketId}) terminated.`);
        }
        ConnectedUsers.set(socket.userId, { socketId: socket.id, username: socket.username });
        console.log(`User ${socket.userId} connected with socket ${socket.id}.`);
        await prisma.user.update({
            where: { id: socket.userId },
            data: { lastOnline: new Date() }
        });
        const UserChatList = await getUserChatList(socket);
        UserChatList.forEach(contactsId => {
            const ContactsSocketid = ConnectedUsers.get(contactsId)?.socketId
            if (ContactsSocketid) {
                io.to(ContactsSocketid).emit("user_online", socket.userId)
            }
        });
        const onlineUsers = UserChatList.filter(contactId => ConnectedUsers.has(contactId))
        socket.emit('online_contacts', onlineUsers);
    } catch (error) {
        console.log("Error occured while connecting ", error.message)
    }
}

async function getUserChatList(socket) {
    const chatLists = await prisma.chat.findMany({
        where: {
            OR: [
                { user1Id: socket.userId },
                { user2Id: socket.userId }
            ]
        },
        select: {
            user1Id: true,
            user2Id: true
        }
    })

    const OnlineUserList = new Set(chatLists.flatMap(chat => [chat.user1Id, chat.user2Id]))
    OnlineUserList.delete(socket.userId)
    return Array.from(OnlineUserList)
}
async function handleMessage(io, socket, ConnectedUser, messageObject, callback) {
    try {
        const { receiverId, content } = messageObject;
        let chatId = messageObject.chatId
        const senderId = socket.userId
        if (!receiverId || !content.trim()) {
            return;
        }
        const message = await prisma.message.create({
            data: {
                chatId: chatId,
                senderId: senderId,
                receiverId: receiverId,
                content: content.replace(/^[\s\n]+|[\s\n]+$/g, ''),
                status: 'SENT'
            }, select: {
                id: true,
                chatId: true,
                content: true,
                receiverId: true,
                senderId: true,
                sentAt: true,
                status: true
            }
        });

        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: {
                lastMessage: content,
                lastMessageAt: message.sentAt,
                lastMessageSenderId: message.senderId,
                unreadCount: {
                    increment: 1
                }
            },
            select: {
                id: true,
                unreadCount: true
            }
        });

        callback({ success: true, messageId: message.id, messageStatus: message.status, sentAt: message.sentAt });
        const receiverSocketId = ConnectedUser.get(message.receiverId)?.socketId;
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("update_unread_count", { chatId: updatedChat.id, unreadCount: updatedChat.unreadCount })
            io.to(receiverSocketId).emit('receive_message', message);
        };

    } catch (err) {
        console.log("Error occured while sending message ", err.message)
    }
}

const handleFileMessage = async (io, socket, ConnectedUser, data, callback) => {
    const { receiverId, content, attachments, chatId } = data;
    const senderId = socket.userId;
    if (!receiverId || !attachments || attachments.length === 0 || !chatId) {
        return callback({ success: false, message: "Invalid data." });
    }
    try {
        const newMessage = await prisma.message.create({
            data: {
                chatId: chatId,
                senderId: senderId,
                receiverId: receiverId,
                content: content || '',
                attachments: {
                    create: attachments.map(file => ({
                        fileUrl: file.fileUrl,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        fileSize: file.fileSize
                    }))
                }
            },
            select: {
                id: true,
                chatId: true,
                content: true,
                receiverId: true,
                senderId: true,
                sentAt: true,
                status: true,
                attachments: {
                    select: {
                        id: true,
                        fileUrl: true,
                        fileName: true,
                        fileSize: true,
                        fileType: true,
                    }
                }
            }
        });
        const lastFileType = newMessage.attachments.length > 0 ? newMessage.attachments[0].fileType : 'File Message';

        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: {
                lastMessage: content || lastFileType,
                lastMessageAt: newMessage.sentAt,
                lastMessageSenderId: senderId,
                unreadCount: { increment: 1 }
            },
            select: {
                id: true,
                unreadCount: true
            }
        });

        const receiverSocketId = ConnectedUser.get(newMessage.receiverId)?.socketId;
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("update_unread_count", { chatId: updatedChat.id, unreadCount: updatedChat.unreadCount })
            io.to(receiverSocketId).emit('receive_message', newMessage);
        };

        callback({
            success: true,
            messageId: newMessage.id,
            messageStatus: newMessage.status,
            sentAt: newMessage.sentAt,
            attachments: newMessage.attachments.map(attachment => ({
                id: attachment.id,
                fileType: attachment.fileType,
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                fileUrl: attachment.fileUrl
            }))
        });

    } catch (error) {
        console.log("Error occured while sending message ", error.message)
        callback({ success: false, message: "Failed to send file message." });
    }
}

async function handleMessagesRead(io, socket, ConnectedUser, messageIds) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                id: {
                    in: messageIds
                }
            },
            select: {
                chatId: true,
                senderId: true,
                receiverId: true
            }
        });
        if (messages.length > 0) {
            await prisma.message.updateMany({
                where: {
                    id: {
                        in: messageIds
                    }
                },
                data: {
                    status: "READ"
                }
            });
        }
        const chat = await prisma.chat.findUnique({
            where: { id: messages[0].chatId },
            select: { unreadCount: true }
        });
        if (chat) {
            const newUnreadCount = Math.max(0, chat.unreadCount - messages.length);
            const updatedChat = await prisma.chat.update({
                where: { id: messages[0].chatId },
                data: {
                    unreadCount: newUnreadCount
                }
            });
            const senderSocketId = ConnectedUser.get(messages[0].senderId)?.socketId;
            if (senderSocketId) {
                io.to(senderSocketId).emit('message_status_update', {
                    messageIds: messageIds,
                    status: 'READ'
                });
            }
            const receiverSocketId = ConnectedUser.get(messages[0].receiverId)?.socketId;
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("update_unread_count", { chatId: updatedChat.id, unreadCount: updatedChat.unreadCount })
            }
        }
    } catch (error) {
        console.log("Error occurred while handling message read:", error.message);
        socket.emit('message_read_error', {
            message: "Failed to mark messages as read. Please try again.",
            details: error.message
        });
    }
}

async function disconnectUser(io, socket, ConnectedUsers) {
    try {
        const userId = socket.userId;
        await prisma.user.update({
            where: { id: userId },
            data: { lastOnline: new Date() }
        });
        console.log('User disconnected:', socket.id);
        ConnectedUsers.delete(userId);

        const contactList = await getUserChatList(socket);
        contactList.forEach(contactId => {
            const contactSocketId = ConnectedUsers.get(contactId)?.socketId;
            if (contactSocketId) {
                io.to(contactSocketId).emit('user_offline', userId);
            }
        });
    } catch (error) {
        console.log("Error occurred while disconnecting:", error.message);
    }
}
async function handleTypingIndicator(io, socket, chatId, ConnectedUser) {
    if (!chatId) {
        return
    }
    const chat = await findChat(chatId);
    if (chat) {
        const otherUserId = chat.user1Id === socket.userId ? chat.user2Id : chat.user1Id;
        const otherUserSocketId = ConnectedUser.get(otherUserId);
        if (otherUserSocketId?.socketId) {
            io.to(otherUserSocketId.socketId).emit("user_typing", {
                chatId: chatId,
                typingUsersId: socket.userId
            });
        }
    }
}

async function handleStopTypingIndicator(io, socket, chatId, ConnectedUser) {
    if (!chatId) {
        return
    }
    const chat = await findChat(chatId);
    if (chat) {
        const otherUserId = chat.user1Id === socket.userId ? chat.user2Id : chat.user1Id;
        const otherUserSocketId = ConnectedUser.get(otherUserId);
        if (otherUserSocketId?.socketId) {
            io.to(otherUserSocketId.socketId).emit("user_stopped_typing", {
                chatId: chatId,
                typingUsersId: socket.userId
            });
        }
    }
}


const findChat = async (chatId) => {
    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId }
        });
        return chat;
    } catch (error) {
        console.log("Error occured while finding chats", error.message)
    }
}

module.exports = { handleUserSession, handleMessage, handleMessagesRead, disconnectUser, handleTypingIndicator, handleStopTypingIndicator, handleFileMessage }