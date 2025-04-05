import React, { useCallback, useEffect, useRef, useState } from "react"
import { activeChatAtom, globalLoadingAtom, viewImageAtom } from "../states/atoms"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import SingleMessageUi from "./SingleMessageUi"
import ChatMessageArea from "./ChatMessageArea"
import AttachmentPreview from "./AttachmentPreview"
import Loader from "./Loader";
import InfiniteScroll from 'react-infinite-scroller';
import ProgressiveImage from "./ProgressiveImage";
import { formatToDDMMYYYY } from "../utils/dateFunction"
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

//EXP removing auto scroll with user guided scroll. No need to auto scroll user can click on arrow and get down to chats 
// TODO: We should add a green / orange dot over arrow which shall help us know when there is new chats. 
// TODO: We can add a ringtone when a new message comes from the same chat user has opened then it shall play. 
// TODO: chat wallpapers

const ChatInterface = ({ socket, fetchMessages, handleTyping, sendFileMessage, sendMessage, scrollToLatestMessage, chatAreaRef, messagesEndRef, messageRefs, showScrollToLatest, hasMore, isSending, typing, attachment, setAttachment, messages, setMessages, message, setMessage }) => {
    const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
    const setViewImage = useSetRecoilState(viewImageAtom);

    const globalLoading = useRecoilValue(globalLoadingAtom)
    // drag and drop functionality test
    const [isDragging, setIsDragging] = useState(false);
    const dropZoneRef = useRef(null);
    const dragCounter = useRef(0);
    // adding date to messages 
    const lastDate = useRef(null);

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
                            <h2 className="block text-md sm:text-lg ">{currentTextingUser?.otherUserName || currentTextingUser.username || "name"}</h2>
                            <span className={`w-2 h-2 sm:w-3 sm:h-3  rounded-full`} style={{ background: `${currentTextingUser?.isOnline ? "#22c55e" : "#9ca3af"}` }}></span>
                        </div>
                        <div className="text-[#ee6145] text-sm sm:text-lg">
                            {typing && "typing..."}
                        </div>
                    </div>
                </section>

                <section id="ChatArea"
                    className={`relative flex flex-col overflow-y-auto bg-[#f6f6f6] px-3 py-2 space-y-2 w-full h-full  ${isDragging ? 'bg-blue-100' : ''}`}
                    onDragEnter={handleDragIn}
                    onDragLeave={handleDragOut}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    ref={node => {
                        dropZoneRef.current = node;
                        chatAreaRef.current = node;
                    }}>
                    {isDragging && (
                        <div className="sticky inset-0 flex items-center justify-center w-full h-full bg-blue-200 bg-opacity-50 z-10 pointer-events-none">
                            <p className="text-lg font-semibold">Drop files here to upload</p>
                        </div>
                    )}
                    {/* {attachment?.length > 0 && (
                        <div className="sticky top-0 left-0 z-9 bg-[#f6f6f6] mb-2 ">
                            {isSending && (
                                <div className="w-full sticky inset-0 flex justify-center items-center z-12 bg-opacity-50">
                                    <Loader className="inline-block mx-auto" size="xs" />
                                </div>
                            )}
                            <AttachmentPreview disabled={isSending} />
                        </div>
                    )} */}
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

                        {
                            messages?.map((msg) => {
                                const messageDate = formatToDDMMYYYY(msg.sentAt);
                                const isNewDate = messageDate !== lastDate.current;
                                lastDate.current = messageDate;
                                return (
                                    <div key={msg.id} className="flex flex-col">
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
                                    </div>
                                )
                            })
                        }
                    </InfiniteScroll>
                    {showScrollToLatest && (
                        <button
                            onClick={scrollToLatestMessage}
                            className="sticky inline bottom-4 left-[100%] bg-gray-900/80 text-white p-2 rounded-full shadow-lg w-10"
                        >
                            ↓
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
                        disableAttachmentButton={isSending || globalLoading.trim() || !currentTextingUser.id || currentTextingUser.isTemporary}
                    />
                </section>
            </div>
        </>
    )
}

export default React.memo(ChatInterface)
