import { useCallback, useRef } from 'react';

const useNotificationSound = (soundFile = "/notification.mp3") => {
    const audioRef = useRef(new Audio(soundFile));

    const playSound = useCallback(() => {
        try {
            audioRef.current.currentTime = 0;
            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => console.error("Sound play failed:", error));
            }
        } catch (err) {
            console.error("Error in notification sound:", err);
        }
    }, [])

    return playSound;
};

export default useNotificationSound;
