import { useLocation } from "react-router-dom"
import Footer from "../components/Footer"
import Navbar from "../components/navbar"
import { useEffect } from "react";

const BasicLayout = ({ children }) => {
    const { pathname, hash } = useLocation();
    const NAVBAR_HEIGHT = 64;

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
