const { Server } = require("socket.io")
const { SocketIdMiddleware } = require("../middleware/SocketMiddleware");
const { handleUserSession, handleMessage, handleMessagesRead, disconnectUser, handleTypingIndicator, handleStopTypingIndicator, handleFileMessage } = require("./SocketFunction");
require("dotenv").config();
const ConnectedUser = new Map()
const prisma = require("../utils/PrismaInit");

const initalizeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigin = process.env.FRONTEND_URL.split(",").filter(Boolean);
                if (!origin || allowedOrigin.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Cors Error origin not allowed."))
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTION'],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true
        }
    });

    io.use(SocketIdMiddleware);


    io.on("connection", (socket) => {
        socket.on("error", err => console.log(err))
        handleUserSession(io, socket, ConnectedUser);

        // create / get chatId middleware
        socket.use(async ([event, data, callback], next) => {
            try {
                if (event === "send_message") {
                    if (typeof data !== 'object' || data === null) return next();
                    const { receiverId, chatId } = data;
                    const senderId = socket.userId;
                    if (!senderId || !receiverId) {
                        return callback?.({ success: false, error: "Missing sender or receiver ID" });
                    }

                    if (chatId?.startsWith("temp-")) {
                        const chat = await prisma.chat.create({
                            data: {
                                user1Id: senderId,
                                user2Id: receiverId
                            }
                        });
                        console.log(`Created new chat from temp ID: ${chat.id}`);
                        socket.emit("created-chatId", { tempId: chatId, realId: chat.id });
                        data.chatId = chat.id;
                    }
                    else if (!chatId) {
                        const existingChat = await prisma.chat.findFirst({
                            where: {
                                OR: [
                                    { AND: [{ user1Id: senderId }, { user2Id: receiverId }] },
                                    { AND: [{ user1Id: receiverId }, { user2Id: senderId }] }
                                ]
                            }
                        });

                        if (!existingChat) {
                            return callback?.({ success: false, error: "No existing chat found and no temp ID provided" });
                        }

                        console.log(`Found existing chat: ${existingChat.id}`);
                        data.chatId = existingChat.id;
                    }
                }
                next();
            } catch (err) {
                console.error("Socket middleware error:", err);
                if (typeof callback === "function") {
                    callback({ success: false, error: "Failed to resolve chatId" });
                }
                // don't call next() — stop processing
            }
        });


        socket.on("send_message", async (messageObject, callback) => {
            await handleMessage(io, socket, ConnectedUser, messageObject, callback);
        })
        socket.on("send_file_message", (data, callback) => handleFileMessage(io, socket, ConnectedUser, data, callback));
        socket.on("typing", (chatId) => {
            handleTypingIndicator(io, socket, chatId, ConnectedUser);
        })

        socket.on("stop_typing", (chatId) => {
            handleStopTypingIndicator(io, socket, chatId, ConnectedUser);
        })

        socket.on("messages_read", (messageIds, chatId) => handleMessagesRead(io, socket, ConnectedUser, messageIds, chatId));

        socket.on('disconnect', () => disconnectUser(io, socket, ConnectedUser));

    });

    return io;
}

module.exports = initalizeSocket