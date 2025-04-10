import { useLocation } from "react-router-dom"
import Footer from "../components/Footer"
import Navbar from "../components/navbar"
import { useEffect, useRef } from "react";

const BasicLayout = ({ children }) => {
    const { pathname, hash } = useLocation();
    const NAVBAR_HEIGHT = 64;
    const wakeupReqCounter = useRef(0);
    const MAX_WAKEUP_REQUESTS = 5;
    const backendResponded = useRef(false);

    useEffect(() => {
        const wakeupBackend = async () => {
            if (wakeupReqCounter.current >= MAX_WAKEUP_REQUESTS || backendResponded.current) return;
            wakeupReqCounter.current += 1;
            try {
                if(!import.meta.env.VITE_SERVER_URL) return;
                const response = await fetch(import.meta.env.VITE_SERVER_URL);
                if (response.ok) {
                    backendResponded.current = true;
                }
            } catch {
                console.log("Backend wakeup request failed (ignored).");
            }
        };

        wakeupBackend();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (!hash) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                const element = document.querySelector(hash);
                if (element) {
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - NAVBAR_HEIGHT;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        };

        // Use a small timeout to ensure the DOM is fully loaded
        const timeoutId = setTimeout(handleScroll, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname, hash]); // Rerun when path or hash changes

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 w-full mt-16">
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default BasicLayout
