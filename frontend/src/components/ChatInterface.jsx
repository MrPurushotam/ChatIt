import React, { useCallback, useEffect, useRef, useState } from "react"
import { activeChatAtom, attachmentAtom, chatsAtom, globalLoadingAtom, messagesAtom, viewImageAtom } from "../states/atoms"
import { useRecoilState, useSetRecoilState } from "recoil"
import SingleMessageUi from "./SingleMessageUi"
import initalizeApi from "../utils/Api"
import useDebounce from "../Hooks/useDebounce";
import ChatMessageArea from "./ChatMessageArea"
import AttachmentPreview from "./AttachmentPreview"
import Loader from "./Loader";
import InfiniteScroll from 'react-infinite-scroller';

const ChatInterface = ({ socket, loggedUser }) => {
    const api = initalizeApi();
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useRecoilState(messagesAtom)
    const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
    const setChats = useSetRecoilState(chatsAtom)
    const setViewImage = useSetRecoilState(viewImageAtom);
    const [attachment, setAttachment] = useRecoilState(attachmentAtom);
    const [typing, setTyping] = useState(false)
    const typingTimeoutRef = useRef(null)
    const messagesEndRef = useRef(null)
    const [globalLoading, setGlobalLoading] = useRecoilState(globalLoadingAtom)
    const [isSending, setIsSending] = useState(false)
    const messageIdsRef = useRef(new Set())
    const messageRefs = useRef({});
    const sanitizeUrl = (url) => url.replace(/\/{2,}/g, '/');
    // drag and drop functionality test
    const [isDragging, setIsDragging] = useState(false);
    const dropZoneRef = useRef(null);
    const dragCounter = useRef(0);
    // It shall keep track of number of message fetched
    const fetchMessageCounter = useRef(0);
    const [hasMore, setHasMore] = useState(true);


    const scrollToFirstUnreadMessage = useCallback(() => {
        const firstUnreadMessage = Object.values(messageRefs.current).find(msg => (msg.status === "SENT" && msg.senderId !== loggedUser.id));
        if (firstUnreadMessage?.element) {
            firstUnreadMessage.element.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [message])

    const updateOutgoingMessage = (chatId, content, sentAt) => {
        setChats((prev) => prev.map((chat) => chat.id === chatId ? { ...chat, lastMessage: content, lastMessageAt: sentAt } : chat));
    }

    const sendMessage = () => {
        if (!currentTextingUser) {
            console.log("Aboorted")
            return
        }
        if (!message.trim()) {
            console.log("Aboorted, Message can't be empty.")
            return;
        }
        console.log("Message is ", message)
        const tempId = Date.now().toString()
        let messageObject = {
            content: message.replace(/^[\s\n]+|[\s\n]+$/g, ''),
            receiverId: currentTextingUser.otherUserId,
            chatId: currentTextingUser.id,
            status: "Sending",
            senderId: loggedUser.id,
            sentAt: new Date().toISOString()
        }
        setMessages(prev => ([...prev, { ...messageObject, id: tempId }]))

        socket.emit("send_message", messageObject, (ack) => {
            if (ack.success) {
                setMessages((prev) => prev?.map(msg =>
                    msg.id === tempId ? { ...msg, id: ack.messageId, status: ack.messageStatus } : msg
                ))
                updateOutgoingMessage(currentTextingUser.id, messageObject.content, ack.sentAt);
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
            console.log("Aboorted")
            return
        }
        setIsSending(true);

        try {
            const formdata = new FormData();

            attachment.forEach((file) => {
                formdata.append("file", file);
            })

            const resp = await api.post(`/chat/upload/${currentTextingUser.id}`, formdata);
            console.log("response form file upload", resp.data);
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
                socket.emit("send_file_message", messageObject, (ack) => {
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
                        updateOutgoingMessage(currentTextingUser.id, messageObject.content, ack.sentAt);
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
    const fetchMessages = async (count = 50) => {
        console.log("Fetch function ran")
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

    const markMessageAsRead = useCallback((messageIds) => {
        socket.emit('messages_read', messageIds);
    }, [socket]);

    const debouncedMarkMessageAsRead = useDebounce(markMessageAsRead, 10);

    const handleScroll = useCallback(() => {
        const messageElements = document.querySelectorAll('.message');
        const viewportHeight = window.innerHeight;
        const messageToRead = [];
        messageElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const messageId = element.dataset.messageId;
            const messageRef = messageRefs.current[messageId];

            if (rect.top >= 0 && rect.bottom <= viewportHeight &&
                messageRef && messageRef.status !== 'READ' &&
                messageRef.senderId !== loggedUser.id
            ) {
                messageToRead.push(messageId);
                messageRefs.current[messageId].status = "READ";
            }
        });
        if (messageToRead.length > 0) {
            debouncedMarkMessageAsRead(messageToRead);
        }
    }, [debouncedMarkMessageAsRead, loggedUser.id]);

    useEffect(() => {
        const chatArea = document.getElementById("ChatArea");
        if (chatArea) {
            chatArea.addEventListener('scroll', handleScroll);
            return () => chatArea.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    useEffect(() => {
        handleScroll();
    }, [messages, handleScroll]);

    useEffect(() => {
        scrollToFirstUnreadMessage()
    }, [messages])

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
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setCurrentTextingUser(null);
                setMessage("");
                setMessages([]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (socket) {

            socket.on("user_typing", ({ chatId, typingUsersId }) => {
                if (currentTextingUser.id === chatId && currentTextingUser.otherUserId === typingUsersId) {
                    setTyping(true)
                }
            })

            socket.on("user_stopped_typing", ({ chatId, typingUsersId }) => {
                if (currentTextingUser.id === chatId && currentTextingUser.otherUserId === typingUsersId) {
                    setTyping(false)
                }
            })

            socket.on("message_status_update", ({ messageIds, status }) => {
                setMessages(prevMessages => {
                    return prevMessages.map(msg => {
                        if (messageIds.includes(msg.id)) {
                            const updatedMsg = { ...msg, status };
                            messageRefs.current[msg.id] = { ...updatedMsg, element: messageRefs.current[msg.id]?.element };
                            return updatedMsg;
                        }
                        return msg;
                    });
                });
            });

            return () => {
                socket.off("user_typing");
                socket.off("user_stop_typing");
                socket.off("message_status_update");
            }
        }
    }, [socket, currentTextingUser, setCurrentTextingUser])


    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
            const allowedFiles = files.slice(0, 4);
            setAttachment(allowedFiles);
        }
    }, [setAttachment]);

    return (
        <>
            <div className='flex flex-col w-full h-screen'>
                <section id="ChatHead" className='flex gap-1 sm:gap-2 md:gap-1 py-2 px-1 w-full items-center bg-[#f5f5f7]  border-b-2 border-gray-200'>
                    <div className='w-12 h-12 sm:w-14 sm:h-14  flex rounded-full overflow-hidden object-contain items-center justify-center bg-transparent p-1'>
                        {
                            currentTextingUser.otherUserProfile ?
                                <img
                                    src={sanitizeUrl(currentTextingUser.otherUserProfile)}
                                    alt="Profile"
                                    className='h-full w-full object-cover rounded-full cursor-pointer'
                                    onClick={() => setViewImage(currentTextingUser.otherUserProfile)}
                                />
                                :
                                <i className="ph-duotone ph-user text-4xl"></i>
                        }
                    </div>

                    <div className='flex flex-col w-full px-2 sm:px-1'>
                        <div className='text-base sm:text-lg  font-semibold flex flex-row gap-2 items-center'>
                            <h2 className="block text-md sm:text-lg ">{currentTextingUser?.otherUserName || currentTextingUser.username || "name"}</h2>
                            <span className={`w-2 h-2 sm:w-3 sm:h-3  rounded-full`} style={{ background: `${currentTextingUser?.isOnline ? "#22c55e" : "#9ca3af"}` }}></span>
                        </div>
                        <div className="text-[#ee6145] text-sm sm:text-lg">
                            {typing && "typing..."}
                        </div>
                    </div>
                </section>

                <section id="ChatArea" className={`flex flex-col overflow-y-auto bg-[#f6f6f6] px-3 py-2 space-y-2 w-full h-full  ${isDragging ? 'bg-blue-100' : ''}`}
                    onDragEnter={handleDragIn}
                    onDragLeave={handleDragOut}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    ref={dropZoneRef}>
                    {isDragging && (
                        <div className="sticky inset-0 flex items-center justify-center w-full h-full bg-blue-200 bg-opacity-50 z-10 pointer-events-none">
                            <p className="text-lg font-semibold">Drop files here to upload</p>
                        </div>
                    )}
                    {attachment.length > 0 && (
                        <div className="sticky top-0 left-0 z-9 bg-[#f6f6f6] mb-2 ">
                            {isSending && (
                                <div className="sticky inset-0 flex justify-center items-center z-12 bg-opacity-50">
                                    <Loader className="w-8 h-8 sm:w-12 sm:h-12" />
                                </div>
                            )}
                            <AttachmentPreview disabled={isSending} />
                        </div>
                    )}
                    {
                        messages.length < 1 ?
                            <div className="w-full h-full flex justify-center items-center text-[#2196f3] font-bold">
                                Start Conversation...
                            </div>
                            :
                            null
                    }
                    <InfiniteScroll
                        className="space-y-2"
                        pageStart={messages.length}
                        loadMore={fetchMessages}
                        hasMore={hasMore}
                        loader={<Loader className=" flex justify-center overflow-hidden" />}
                        useWindow={false}
                        isReverse={true}
                        getScrollParent={() => dropZoneRef.current}
                    >

                        {
                            messages?.map((msg) => {
                                return (
                                    <div
                                        key={msg.id}
                                        className="message"
                                        data-message-id={msg.id}
                                        ref={el => {
                                            if (el) {
                                                messageRefs.current[msg.id] = { ...msg, element: el };
                                            }
                                        }}
                                    >
                                        <SingleMessageUi
                                            message={msg}
                                            isUser={msg.senderId !== currentTextingUser.otherUserId}
                                            messageSentBy={`${msg.senderId === currentTextingUser.otherUserId ? currentTextingUser.otherUserName : "You"}`}
                                        />
                                    </div>
                                )
                            })
                        }
                    </InfiniteScroll>
                    <div ref={messagesEndRef} />

                </section>

                <section id="ChatMessageArea" className="p-2 sm:p-3 w-full border-t-2 border-gray-100 bg-[#f4f4f6]">
                    <ChatMessageArea
                        socket={socket}
                        handleTyping={handleTyping}
                        sendMessage={() => {
                            if (attachment.length > 0) {
                                sendFileMessage();
                            } else {
                                sendMessage()
                            }
                        }}
                        InputOnChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }}
                        message={message}
                        disableAttachmentButton={isSending || globalLoading.trim() || !currentTextingUser.id}
                    />
                </section>
            </div>
        </>
    )
}

export default React.memo(ChatInterface)
