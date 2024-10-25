import React, { useEffect, useState } from 'react';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, FacebookIcon, TwitterIcon, WhatsappIcon } from "react-share";
import { selectedDropDownItemAtom } from '../states/atoms';
import { useSetRecoilState } from 'recoil';

const InviteUser = () => {
    const inviteLink = import.meta.env.VITE_INVITE_URL;
    const [copied, setCopied] = useState(false);
    const setSelectedDropdownItem = useSetRecoilState(selectedDropDownItemAtom);
    const customMessage = import.meta.env.VITE_INVITE_MESSAGE || "Hey there! 🎉 Come join me on ChatIt, where every chat is a chance to spark joy and fun! Let’s create some unforgettable memories together!";
    const customHashtags = import.meta.env.VITE_INVITE_HASHTAGS.split(" ").join(",") || "#ChatIt"
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };


    const handleKeyPress = (event) => {
        if (event.key === "Escape") {
            setSelectedDropdownItem("");
        }
    }
    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress)
        return () => {
            window.removeEventListener("keydown", handleKeyPress)
        }
    }, [])

    return (
        <div className='flex flex-col space-y-4 sm:space-y-6 py-4 sm:py-6'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-gray-900 text-2xl sm:text-3xl'>Invite Friends</h1>
                <i className="ph-duotone ph-arrow-fat-line-left text-xl sm:text-2xl hover:text-[#ee6145] 
            transition-transform transform hover:scale-110 cursor-pointer"
                    onClick={() => setSelectedDropdownItem(null)}
                ></i>
            </div>

            <p className='text-gray-600 text-base sm:text-lg tracking-wide sm:tracking-wider'>
                Share the link with your friends and invite them to join the app.
            </p>

            <div className='flex items-center'>
                <button onClick={handleCopy}
                    className='flex items-center space-x-2 px-3 sm:px-4 py-2 hover:bg-[#e05b40] 
                bg-[#ee6145] text-white rounded-md transition-colors duration-300 text-sm sm:text-base'>
                    {copied ? (
                        <>
                            <i className="ph-duotone ph-check text-base sm:text-lg"></i>
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <i className="ph-duotone ph-copy-simple text-base sm:text-lg"></i>
                            <span>Copy link</span>
                            <span className="hidden sm:inline">to clipboard</span>
                        </>
                    )}
                </button>
            </div>

            <div>
                <h4 className='text-sm sm:text-md font-medium mb-2 text-gray-700'>Or share directly:</h4>
                <div className='flex space-x-2 sm:space-x-3'>
                    <FacebookShareButton url={inviteLink} quote={customMessage} hashtag={customHashtags}>
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>

                    <TwitterShareButton url={inviteLink} title={customMessage}>
                        <TwitterIcon size={32} round />
                    </TwitterShareButton>

                    <WhatsappShareButton url={inviteLink} title={customMessage}>
                        <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                </div>
            </div>
        </div>
    );
};

export default InviteUser;
