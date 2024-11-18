import { useRef } from 'react';

const useNotificationSound = (soundFile="/notification.mp3") => {
    const audioRef = useRef(new Audio(soundFile));

    const playSound = () => {
        audioRef.current.play().catch(error => {
            console.error("Error playing notification ringtone:", error);
        });
    };

    return playSound;
};

export default useNotificationSound;
