import React, { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import TextEditor from './TextEditor';
import Attachment from './Attachment';

const ChatMessageArea = ({ sendMessage, InputOnChange, message, disableAttachmentButton }) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [attachmentVisible, setAttachmentVisible] = useState(false)
    const pickerRef = useRef();
    const textareaRef = useRef();
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setIsPickerVisible(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleEmojiSelect = (emoji) => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = message.slice(0, start) + emoji.native + message.slice(end);
            InputOnChange({ target: { value: newText } });
            textarea.setSelectionRange(start + emoji.native.length, start + emoji.native.length);
        }
    };

    const togglePicker = () => {
        setIsPickerVisible((prev) => !prev);
    };

    return (
        <div className="relative w-full flex flex-row items-center justify-between space-x-2 p-2 bg-white shadow-md rounded-md">
            <button className="p-2 text-3xl text-gray-700  hover:text-[#ee5b45]/70 font-bold rounded-md" onClick={togglePicker}>
                <i className="ph-duotone ph-smiley"></i>
            </button>
            {isPickerVisible && (
                <div className="absolute bottom-20" ref={pickerRef}>
                    <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="light"
                        icons="solid"
                        emojiVersion="15.0"
                        locale="en"
                        navPosition="top"
                        searchPosition="sticky"
                        previewPosition="none"
                        skinTonePosition="none"
                        autoFocus={false}
                    />
                </div>
            )}

            <div className="flex-1 mx-2">
                <TextEditor
                    InputOnChange={InputOnChange}
                    value={message}
                    InputKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage();
                        }
                    }}
                    ref={textareaRef}
                />
            </div>

            <button id="AttachmentOption" className={`p-2 text-2xl rounded-md relative ${disableAttachmentButton
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:text-[#ee6145]/70'
                } `}
                onClick={() => setAttachmentVisible(prev => !prev)}
                disabled={disableAttachmentButton}
            >
                <i className="ph-duotone ph-paperclip"></i>
            </button>

            {
                attachmentVisible && (
                    <Attachment setAttachmentVisible={setAttachmentVisible} />
                )
            }

            {/* Send Button */}
            <button
                className="p-2 text-2xl text-gray-700  hover:text-[#ee5b45]/70 rounded-md"
                onClick={sendMessage}
            >
                <i className="ph-duotone ph-paper-plane-right"></i>
            </button>
        </div >
    );
};

export default ChatMessageArea;
