import React, { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil';
import { attachmentAtom } from '../states/atoms';

const Attachment = ({ setAttachmentVisible }) => {
    const setAttachment = useSetRecoilState(attachmentAtom);
    const fileInputRef= useRef();
    const innerRef = useRef();
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (innerRef.current && !innerRef.current.contains(e.target)) {
                setAttachmentVisible(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleFileChange=(event)=>{
        const files= Array.from(event.target.files);
        const allowedFiles= files.slice(0,4);
        setAttachment(allowedFiles)
        setAttachmentVisible(false);
    }
    const triggerFileInput = (type) => {
        fileInputRef.current.setAttribute('accept', getAcceptString(type));
        fileInputRef.current.click();
    };

    const getAcceptString = (type) => {
        switch (type) {
            case 'image': return 'image/*';
            case 'video': return 'video/*';
            case 'audio': return 'audio/*';
            case 'file': return 'application/*';
        }
    };

    return (
        <div ref={innerRef} className='absolute bottom-20 right-5 rounded-md shadow-md border-2 border-gray-700 bg-gray-200 flex flex-col w-40 max-w-xs p-2 '>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
            />
            <div className='grid grid-cols-3 gap-2 justify-items-center items-center overflow-auto'>
                <button
                    className='file-icon'
                    onClick={() => triggerFileInput('image')}
                >
                    <i className="ph-duotone ph-image text-3xl"></i>
                </button>

                {/* Video Icon */}
                <button
                    className='file-icon'
                    onClick={() => triggerFileInput('video')}
                >
                    <i className="ph-duotone ph-video text-3xl"></i>
                </button>

                <button
                    className='file-icon'
                    onClick={() => triggerFileInput('audio')}
                >
                    <i className="ph-duotone ph-headphones text-3xl"></i>
                </button>

                {/* File Icon */}
                <button
                    className='file-icon'
                    onClick={() => triggerFileInput('file')}
                >
                    <i className="ph-duotone ph-file text-3xl"></i>
                </button>
            </div>
            <h2 className='text-[0.6rem] text-red-500 select-none'>*You can send at max 4 files</h2>
        </div>
    )
}

export default Attachment
