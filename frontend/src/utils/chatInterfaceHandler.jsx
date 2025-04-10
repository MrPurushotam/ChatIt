import React, { useCallback, useEffect, useRef, useState } from 'react'
import initalizeApi from './Api';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { activeChatAtom, attachmentAtom, chatsAtom, globalLoadingAtom, messagesAtom } from '../states/atoms';
import useDebounce from '../Hooks/useDebounce';


// FIXME: There is some issue with auto scrolling. We need to push the useEffect hook to ChatInterface page. 

const ChatInterfaceHandler = ({ socket, loggedUser, children }) => {
    const api = initalizeApi();
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useRecoilState(messagesAtom)
    const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
    const setChats = useSetRecoilState(chatsAtom)

    const [typing, setTyping] = useState(false)

    const typingTimeoutRef = useRef(null)

    const messageIdsRef = useRef(new Set())
    const messageRefs = useRef({});

    const [attachment, setAttachment] = useRecoilState(attachmentAtom);

    const [globalLoading, setGlobalLoading] = useRecoilState(globalLoadingAtom)
    const [isSending, setIsSending] = useState(false)

    const fetchMessageCounter = useRef(0);
    const [hasMore, setHasMore] = useState(true);

    // dynamic go to top button

    useEffect(() => {
        if (currentTextingUser) {
            messageRefs.current = {}
            fetchMessageCounter.current = 0;
            setHasMore(true);
            setMessages([]);
            setAttachment([]);
            messageIdsRef.current.clear();
            fetchMessages();
        }
    }, [currentTextingUser]);


    useEffect(() => {
        if (socket) {
            socket?.on("user_typing", ({ chatId, typingUsersId }) => {
                if (currentTextingUser.id === chatId && currentTextingUser.otherUserId === typingUsersId) {
                    setTyping(true);
                }
            });

            socket?.on("user_stopped_typing", ({ chatId, typingUsersId }) => {
                if (currentTextingUser.id === chatId && currentTextingUser.otherUserId === typingUsersId) {
                    setTyping(false);
                }
            });

            socket?.on("message_status_update", ({ messageIds, status }) => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        messageIds.includes(msg.id) ? { ...msg, status } : msg
                    )
                );
            });

            return () => {
                socket?.off("user_typing");
                socket?.off("user_stopped_typing");
                socket?.off("message_status_update");
            };
        }
    }, [socket, currentTextingUser]);



    const fetchMessages = async (count = 50) => {
        if (globalLoading === "fetching-messages") {
            return;
        }
        setGlobalLoading("fetching-messages");
        try {
            const resp = await api.post(`/message/${currentTextingUser.id}`, { start: fetchMessageCounter.current, end: fetchMessageCounter.current + count });
            if (resp.data.success) {
                setMessages(prev => {
                    const uniqueMessages = resp.data.messages.reverse().filter((newMessage) => {
                        if (!messageIdsRef.current.has(newMessage.id)) {
                            messageIdsRef.current.add(newMessage.id);
                            return true;
                        }
                        return false;
                    });
                    const updatedMessages = [...uniqueMessages, ...prev]

                    if (resp.data.messages.length === count) {
                        fetchMessageCounter.current += count;
                        setHasMore(true);
                    } else {
                        setHasMore(false);
                    }
                    return updatedMessages;
                })
            } else {
                console.error("Error occurred while fetching chat messages, ", resp.data.message);
            }
        } catch (error) {
            console.error("Error occurred while fetching messages ", error.message);
        } finally {
            setGlobalLoading("");
        }
    };

    // TODO: check if scroll logic is working perfectly or not. 

    const updateOutgoingMessage = (chatId, content, sentAt) => {
        setChats((prev) => prev.map((chat) => chat.id === chatId ? { ...chat, lastMessage: content, lastMessageAt: sentAt } : chat));
    }
    
    const removeTemporaryUserOnEscape = (id) => {
        console.log("ran this ", id)
        setChats((prevChats) => prevChats.filter(chat => !(chat.id === id && chat.isTemporary)));
    }
    const sendMessage = () => {
        if (!currentTextingUser) {
            console.log("Aboorted")
            return
        }
        if (!message.trim()) {
            return;
        }
        console.log("Message is ", message)
        const tempId = Date.now().toString();
        let messageObject = {
            content: message.replace(/^[\s\n]+|[\s\n]+$/g, ''),
            receiverId: currentTextingUser.otherUserId,
            chatId: currentTextingUser.id,
            status: "Sending",
            senderId: loggedUser.id,
            sentAt: new Date().toISOString()
        }
        setMessages(prev => ([...prev, { ...messageObject, id: tempId }]))

        socket?.emit("send_message", messageObject, (ack) => {
            if (ack.success) {
                setMessages((prev) => prev?.map(msg =>
                    msg.id === tempId ? { ...msg, id: ack.messageId, status: ack.messageStatus } : msg
                ))
                updateOutgoingMessage(
                    currentTextingUser.id,
                    messageObject.content || (messageObject.attachments?.[0]?.fileType || "File"),
                    ack.sentAt
                );
            } else {
                setMessages((prev) => prev.map(msg =>
                    (msg.id === tempId) ? { ...msg, status: "FAILED" } : msg
                ))
            }
        })
        setMessage("")
    }
    // FIXME: add globalLoader  here.
    const sendFileMessage = async () => {
        if (attachment.length == 0 || isSending) {
            return;
        }
        if (!currentTextingUser) {
            return
        }
        setIsSending(true);

        try {
            const formdata = new FormData();

            attachment.forEach((file) => {
                formdata.append("file", file);
            })

            const resp = await api.post(`/chat/upload/${currentTextingUser.id}`, formdata);
            if (resp.data.success) {
                const fileInfo = resp.data.files;
                const tempId = Date.now().toString();
                const messageObject = {
                    id: tempId,
                    content: message || "",
                    receiverId: currentTextingUser.otherUserId,
                    chatId: currentTextingUser.id,
                    status: "Sending",
                    senderId: loggedUser.id,
                    sentAt: new Date().toISOString(),
                    attachments: fileInfo.map((file, i) => ({
                        id: i,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        fileSize: file.fileSize,
                        fileUrl: file.fileUrl
                    }))
                }

                setMessages(prev => [...prev, messageObject]);
                socket?.emit("send_file_message", messageObject, (ack) => {
                    console.log("Ack is  ", ack)
                    if (ack.success) {
                        setMessages(prevMessages => {
                            return prevMessages.map(msg =>
                                msg.id === tempId ? {
                                    ...msg,
                                    id: ack.messageId,
                                    status: ack.messageStatus,
                                    sentAt: ack.sentAt,
                                    attachments: ack.attachments
                                } : msg
                            )
                        })
                        updateOutgoingMessage(currentTextingUser.id, messageObject?.content || messageObject?.attachments[0]?.type, ack.sentAt);
                    } else {
                        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId))
                        console.error("Failed to send file message");
                    }
                })
            }
            else {
                console.log("Some issue occured while file uploading");
            }
        } catch (error) {
            console.log("Some error occurred while sending file message ", error.message);
        } finally {
            setAttachment([]);
            setMessage('');
            setIsSending(false);
        }
    }

    const handleTyping = () => {
        if (socket && currentTextingUser) {
            socket.emit("typing", currentTextingUser.id)

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", currentTextingUser.id)
            }, 1500)
        }
    }
    // TODO: mark message read has some error in it

    // const handleScroll = useCallback(() => {
    //     setIsUserScrolling(true);
    //     const chatArea = document.getElementById("ChatArea");
    //     if (!chatArea) return;

    //     const isAtBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight <= 12;
    //     if (isAtBottom) {
    //         setIsUserScrolling(false);
    //         setShowScrollToLatest(false);
    //     } else {
    //         setIsUserScrolling(true);
    //         setShowScrollToLatest(true);
    //     }

    //     const messageElements = document.querySelectorAll('.message');
    //     const viewportHeight = chatArea.clientHeight;
    //     const messageToRead = [];
    //     messageElements.forEach((element) => {
    //         const rect = element.getBoundingClientRect();
    //         const messageId = element.dataset.messageId;
    //         const messageRef = messageRefs.current[messageId];

    //         if (rect.top >= 0 && rect.bottom <= viewportHeight &&
    //             messageRef && messageRef.status !== 'READ' &&
    //             messageRef.senderId !== loggedUser.id
    //         ) {
    //             messageToRead.push(messageId);
    //             messageRefs.current[messageId].status = "READ";
    //         }
    //     });
    //     if (messageToRead.length > 0) {
    //         debouncedMarkMessageAsRead(messageToRead, currentTextingUser.id);
    //     }
    // }, [debouncedMarkMessageAsRead, loggedUser.id, currentTextingUser.id]);




    return (
        <React.Fragment>
            {React.Children.map(children, child =>
                React.cloneElement(child, { socket, loggedUser, fetchMessages, handleTyping, removeTemporaryUserOnEscape, sendFileMessage, sendMessage, messageRefs, hasMore, isSending, typing, attachment, setAttachment, messages, setMessages, message, setMessage })
            )}
        </React.Fragment>
    )
}

export default ChatInterfaceHandler
