import React, { useCallback, useEffect, useRef, useState } from "react"
import { activeChatAtom, chatsAtom, globalLoadingAtom, viewImageAtom } from "../states/atoms"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import SingleMessageUi from "./SingleMessageUi"
import ChatMessageArea from "./ChatMessageArea"
import Loader from "./Loader";
import InfiniteScroll from 'react-infinite-scroller';
import ProgressiveImage from "./ProgressiveImage";
import { formatToDDMMYYYY } from "../utils/dateFunction"
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import useDebounce from "../Hooks/useDebounce"

//EXP removing auto scroll with user guided scroll. No need to auto scroll user can click on arrow and get down to chats 
// TODO: We should add a green / orange dot over arrow which shall help us know when there is new chats. 
// TODO: We can add a ringtone when a new message comes from the same chat user has opened then it shall play. 
// TODO: chat wallpapers

const ChatInterface = ({ socket, loggedUser, fetchMessages, handleTyping, removeTemporaryUserOnEscape, sendFileMessage, sendMessage, messageRefs, hasMore, isSending, typing, attachment, setAttachment, messages, setMessages, message, setMessage }) => {
    const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
    const setViewImage = useSetRecoilState(viewImageAtom);
    const setChats = useSetRecoilState(chatsAtom);
    const globalLoading = useRecoilValue(globalLoadingAtom);
    // drag and drop functionality test
    const [isDragging, setIsDragging] = useState(false);
    const dropZoneRef = useRef(null);
    const dragCounter = useRef(0);
    // adding date to messages 
    const lastDate = useRef(null);
    // ref to track prev chat id so that we can remove temporary chat from the sidebar
    const previousChatIdRef = useRef(null);

    const chatAreaRef = useRef(null);
    const messagesEndRef = useRef(null)
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
    const [hasNewUnreadMessages, setHasNewUnreadMessages] = useState(false);
    const userScrolledManually = useRef(false);
    const prevMessagesLength = useRef(0);

    useEffect(() => {
        if (previousChatIdRef.current && previousChatIdRef.current !== currentTextingUser?.id) {
            removeTemporaryUserOnEscape(previousChatIdRef.current);
        }
        previousChatIdRef.current = currentTextingUser?.id;
    }, [currentTextingUser, removeTemporaryUserOnEscape]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                const id = currentTextingUser.id;
                setCurrentTextingUser(null);
                removeTemporaryUserOnEscape(id);
                setMessage("");
                setMessages([]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTextingUser, removeTemporaryUserOnEscape, setMessage, setMessages]);

    useEffect(() => {
        const driverObj = driver({
            showProgress: true,
            steps: [
                {
                    element: '#ChatHead',
                    popover: {
                        title: 'Chat Header',
                        description: 'Here you can see the profile picture and status of the person you\'re chatting with,tap on profile to see enlarged view.'
                    }
                },
                {
                    element: '#ChatArea',
                    popover: {
                        title: 'Chat Area',
                        description: 'All your messages appear here. You can scroll through your chat history and drop files to send them.'
                    }
                },
                {
                    element: '#ChatMessageArea',
                    popover: {
                        title: 'Message Input',
                        description: 'Type your messages here. Remeber to be polite and follow privacy policy. '
                    }
                },
                {
                    element: '#AttachmentOption',
                    popover: {
                        title: 'Attachment Option',
                        description: 'Select the desired attachement you want to share and simply add it to share. '
                    }
                }
            ]
        });

        // Start the tutorial if this is the user's first time
        const hasSeenTutorial = localStorage.getItem('chatTutorialStatus');
        if (!hasSeenTutorial && currentTextingUser?.id) {
            driverObj.drive();
            localStorage.setItem('chatTutorialStatus', 'true');
        }

        return () => {
            driverObj.destroy();
        };
    }, []);

    const scrollToLatestMessage = useCallback(() => {
        if (messagesEndRef?.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            setShowScrollToBottomButton(false);
            userScrolledManually.current = false;
            setIsUserScrolling(false);
        }
    }, []);

    const scrollToFirstUnreadMessage = useCallback(() => {
        if (userScrolledManually.current) return;

        const firstUnreadMessage = Object.values(messageRefs?.current || {})
            .find(msg => (msg.status === "SENT" && msg.senderId !== loggedUser?.id));

        if (firstUnreadMessage?.element) {
            firstUnreadMessage.element.scrollIntoView({ behavior: "smooth", block: "center" });
            setHasNewUnreadMessages(false);
        } else {
            scrollToLatestMessage();
        }
    }, [loggedUser?.id, scrollToLatestMessage]);

    const markMessageAsRead = useCallback((messageIds, chatId) => {
        if (messageIds.length > 0 && chatId) {
            socket?.emit('messages_read', messageIds, chatId);
            setChats((prev) => prev.map((chat) =>
                chat.id === chatId
                    ? { ...chat, unreadCount: Math.max(0, chat.unreadCount - messageIds.length) }
                    : chat
            ));
        }
    }, [socket]);


    const debouncedMarkMessageAsRead = useDebounce(markMessageAsRead, 10);

    // Handle scroll events
    const handleScroll = useCallback(() => {
        if (!chatAreaRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatAreaRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight <= 20;

        // If user scrolls manually, track it
        if (!isAtBottom && !userScrolledManually.current) {
            userScrolledManually.current = true;
            setIsUserScrolling(true);
        }

        // Show/hide scroll to bottom button
        setShowScrollToBottomButton(!isAtBottom);

        // Check for visible messages to mark as read
        const messageElements = chatAreaRef.current.querySelectorAll('.message');
        const messagesToRead = [];
        const viewportTop = chatAreaRef.current.getBoundingClientRect().top;
        const viewportBottom = viewportTop + clientHeight;

        messageElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const messageId = element.dataset.messageId;
            const messageRef = messageRefs?.current?.[messageId];

            // Check if message is visible and needs to be marked as read
            if (rect.top >= viewportTop &&
                rect.bottom <= viewportBottom &&
                messageRef &&
                messageRef.status !== 'READ' &&
                messageRef.senderId !== loggedUser?.id
            ) {
                messagesToRead.push(messageId);
                if (messageRefs?.current) {
                    messageRefs.current[messageId].status = "READ";
                }
            }
        });

        if (messagesToRead.length > 0 && currentTextingUser?.id) {
            debouncedMarkMessageAsRead(messagesToRead, currentTextingUser?.id);
        }
    }, [currentTextingUser?.id, debouncedMarkMessageAsRead, loggedUser?.id]);

    const debouncedHandleScroll = useDebounce(handleScroll, 60);
    useEffect(() => {
        const chatArea = chatAreaRef.current;
        if (chatArea) {
            chatArea.addEventListener('scroll', debouncedHandleScroll);
            return () => chatArea.removeEventListener('scroll', debouncedHandleScroll);
        }
    }, [debouncedHandleScroll]);

    useEffect(() => {
        // Keep the screen at the most recent message when the user sends multiple messages
        if (!isUserScrolling && messages.length > 0) {
            const chatArea = chatAreaRef.current;
            if (!chatArea) return;

            const isAtBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight <= 12;

            if (isAtBottom || isSending) {
                scrollToLatestMessage();
            }
        }
    }, [messages, isUserScrolling, isSending, scrollToLatestMessage]);

    // Handle initial scroll and detect new messages
    useEffect(() => {
        // Check if new messages have arrived
        if (messages.length > prevMessagesLength.current) {
            const newMessagesByOthers = messages.slice(prevMessagesLength.current).some(
                msg => msg.senderId !== loggedUser?.id
            );

            if (newMessagesByOthers) {
                setHasNewUnreadMessages(true);
            }

            // If new message is from the current user or we're at the bottom, scroll to bottom
            const isCurrentUserMessage = messages.length > 0 &&
                messages[messages.length - 1].senderId === loggedUser?.id;

            if (isCurrentUserMessage || isSending || !userScrolledManually.current) {
                scrollToLatestMessage();
            }
        }

        // Initial load - scroll to first unread or latest
        if (prevMessagesLength.current === 0 && messages.length > 0) {
            scrollToFirstUnreadMessage();
        }

        prevMessagesLength.current = messages.length;
    }, [messages, loggedUser?.id, isSending, scrollToLatestMessage, scrollToFirstUnreadMessage]);

    useEffect(() => {
        userScrolledManually.current = false;
        setIsUserScrolling(false);
        prevMessagesLength.current = 0;
    }, [currentTextingUser?.id]);


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

    const removeAttachment = (index) => {
        setAttachment((prev) => prev.filter((_, i) => i !== index));
    };
    return (
        <>
            <div className='flex flex-col w-full h-screen'>
                <section id="ChatHead" className='flex gap-1 sm:gap-2 md:gap-1 py-2 px-1 w-full items-center bg-[#f5f5f7]  border-b-2 border-gray-200'>
                    <div className='w-12 h-12 sm:w-14 sm:h-14  flex rounded-full overflow-hidden object-contain items-center justify-center bg-transparent p-1'>
                        {
                            currentTextingUser.otherUserProfile ?
                                <ProgressiveImage src={currentTextingUser.otherUserProfile} placeholder="https://assets-v2.lottiefiles.com/a/04b5804a-1161-11ee-b72d-2fca51545fab/sWU9zH0HSi.gif">
                                    {(src, loading) => (
                                        <img
                                            src={src}
                                            alt="Profile"
                                            className={`h-full w-full object-cover rounded-full cursor-pointer ${loading ? "blur-sm" : "blur-0"}`}
                                            onClick={() => setViewImage(currentTextingUser.otherUserProfile)}
                                        />
                                    )}
                                </ProgressiveImage>
                                :
                                <i className="ph-duotone ph-user text-4xl"></i>
                        }
                    </div>

                    <div className='flex flex-col w-full px-2 sm:px-1'>
                        <div className='text-base sm:text-lg  font-semibold flex flex-row gap-2 items-center'>
                            <h2 className="block text-md sm:text-lg ">{currentTextingUser?.otherUserDisplayName || currentTextingUser.username || "name"}</h2>
                            <span className={`w-2 h-2 sm:w-3 sm:h-3  rounded-full`} style={{ background: `${currentTextingUser?.isOnline ? "#22c55e" : "#9ca3af"}` }}></span>
                        </div>
                        <div className="text-[#ee6145] text-sm sm:text-lg">
                            {typing && "typing..."}
                        </div>
                    </div>
                </section>

                <section id="ChatArea"
                    className={`relative flex flex-col overflow-y-auto  bg-[#f6f6f6] px-3 py-2 space-y-2 w-full h-full`}
                    onDragEnter={handleDragIn}
                    onDragLeave={handleDragOut}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    ref={node => {
                        dropZoneRef.current = node;
                        chatAreaRef.current = node;
                    }}>
                    {isDragging && (
                        <>
                            <div className="absolute inset-0 bg-blue-100/40 z-30"></div>
                            <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-blue-400 rounded-lg shadow-lg z-40 animate-bounce-once">
                                <div className="flex flex-col items-center gap-3 py-3">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                        <i className="ph-duotone ph-upload-simple text-3xl"></i>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">Drop files here to upload</p>
                                </div>
                            </div>
                        </>
                    )}
                    {
                        messages?.length < 1 ?
                            <div className="w-full h-full flex justify-center items-center text-[#2196f3] font-bold">
                                Start Conversation...
                            </div>
                            :
                            null
                    }
                    <InfiniteScroll
                        className="space-y-2"
                        pageStart={messages?.length}
                        loadMore={fetchMessages}
                        hasMore={hasMore}
                        loader={<Loader key="chat-loader" className=" flex justify-center overflow-hidden mx-auto" size="xs" />}
                        useWindow={false}
                        isReverse={true}
                        getScrollParent={() => dropZoneRef.current}
                        key={121}
                    >
                        {messages?.map((msg) => {
                            const messageDate = formatToDDMMYYYY(msg.sentAt);
                            const isNewDate = messageDate !== lastDate.current;
                            lastDate.current = messageDate;

                            return (
                                <React.Fragment key={msg.id}>
                                    {isNewDate && (
                                        <div className="flex justify-center items-center my-4">
                                            <div className="flex-grow h-[1px] bg-gradient-to-l from-gray-400 via-gray-400 to-transparent" />
                                            <span className="mx-4 px-4 py-1 text-black text-sm font-medium rounded-full ">
                                                {messageDate}
                                            </span>
                                            <div className="flex-grow h-[1px] bg-gradient-to-l from-transparent via-gray-400 to-gray-400" />
                                        </div>
                                    )}
                                    <div
                                        className="message"
                                        data-message-id={msg.id}
                                        ref={(el) => {
                                            if (el) {
                                                messageRefs.current[msg.id] = { ...msg, element: el };
                                            }
                                        }}
                                    >
                                        <SingleMessageUi
                                            message={msg}
                                            isUser={msg.senderId !== currentTextingUser.otherUserId}
                                            messageSentBy={`${msg.senderId === currentTextingUser.otherUserId ? currentTextingUser.otherUserDisplayName : "You"}`}
                                        />
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </InfiniteScroll>
                    {showScrollToBottomButton && (
                        <button
                            onClick={scrollToLatestMessage}
                            className={`sticky inline bottom-4 left-[95%] bg-gray-900/80 text-white p-2 rounded-full shadow-lg w-10 h-10 flex items-center justify-center z-10`}
                        >
                            {hasNewUnreadMessages ? (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full"></span>
                            ) : null}
                            <span>↓</span>
                        </button>
                    )}
                    <div ref={messagesEndRef} />
                </section>

                {attachment?.length > 0 && (
                    <div className="relative">
                        {isSending && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                                <Loader size="sm" />
                            </div>
                        )}
                        <div className="flex flex-wrap gap-3 p-3 bg-[#f9fafb] border-t border-gray-300">
                            {attachment.map((file, index) => {
                                const fileType = file.type.split('/')[0];
                                const isImage = fileType === 'image';
                                const isVideo = fileType === 'video';
                                const isAudio = fileType === 'audio';

                                return (
                                    <div
                                        key={index}
                                        className="relative flex flex-col items-center justify-center w-24 h-24 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md"
                                    >
                                        {isImage ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : isVideo ? (
                                            <video
                                                src={URL.createObjectURL(file)}
                                                className="object-cover w-full h-full"
                                                controls
                                            />
                                        ) : isAudio ? (
                                            <div className="flex flex-col items-center justify-center w-full h-full text-blue-500">
                                                <i className="ph-duotone ph-music-note text-3xl"></i>
                                                <span className="text-xs truncate px-1 text-center">{file.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-700">
                                                <i className="ph-duotone ph-file text-3xl"></i>
                                                <span className="text-xs truncate px-1 text-center">{file.name}</span>
                                            </div>
                                        )}
                                        <button
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
                                            onClick={() => removeAttachment(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <section id="ChatMessageArea" className="p-2 sm:p-3 w-full border-t-2 border-gray-100 bg-[#f4f4f6]">
                    <ChatMessageArea
                        socket={socket}
                        handleTyping={handleTyping}
                        sendMessage={() => {
                            if (attachment?.length > 0) {
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
                        disableAttachmentButton={isSending || globalLoading.trim() || !currentTextingUser.id || currentTextingUser?.isTemporary}
                    />
                </section>
            </div>
        </>
    )
}

export default React.memo(ChatInterface)
