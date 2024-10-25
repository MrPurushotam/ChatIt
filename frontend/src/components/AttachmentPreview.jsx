import React from 'react';
import { attachmentAtom } from '../states/atoms';
import { useRecoilState } from 'recoil';

const AttachmentPreview = ({ disabled }) => {
    const [attachments, setAttachments] = useRecoilState(attachmentAtom);

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Render attachment preview with images being zoomed in to fit the grid cells (object-cover)
    const renderPreview = (file, index) => {
        if (file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover object-fit cursor-pointer rounded-md"
            />;
        } else if (file.type.startsWith('video/')) {
            return <video src={URL.createObjectURL(file)}
                controls
                muted
                className="w-full h-full object-cover cursor-pointer rounded-md"
            />;
        } else if (file.type.startsWith('audio/')) {
            return (
                <audio
                    src={URL.createObjectURL(file)}
                    controls
                    className="w-full h-full bg-gray-200 cursor-pointer rounded-md"
                >
                    Your browser does not support the audio element.
                </audio>
            );
        } else {
            return <div className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer rounded-md">{file.name}</div>;
        }
    };

    if (attachments.length === 0) return null;

    return (
        <div className='p-2 bg-slate-300 rounded-md overflow-x-hidden h-screen w-full '>
            <div className={`grid gap-2 aspect-ratio aspect-square h-[80%] w-full  ${attachments.length === 1 ? 'grid-cols-1' : attachments.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                {
                    attachments.map((file, index) => (
                        <div key={index} className="relative group">
                            {renderPreview(file, index)}
                            <button
                                onClick={() => removeAttachment(index)}
                                disabled={disabled}
                                className='absolute top-1 right-1 text-red-500 font-bold rounded-full w-5 h-5 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity'
                            >
                                <i className="ph-duotone ph-x text-xl"></i>
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default AttachmentPreview;
