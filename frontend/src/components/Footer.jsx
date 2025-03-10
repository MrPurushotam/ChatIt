import { Link } from 'react-router-dom'
import Logo from './Logo'

const Footer = () => {
    return (
        <>
            <section className="w-full bg-neutral-900 text-white py-10" id="footer">
                <div className="container flex flex-col md:flex-row md:justify-between md:items-center px-6">

                    {/* Logo & Description */}
                    <div className="flex flex-col items-start">
                        <Logo className="text-white text-3xl font-bold bg-white" />
                        <p className="text-gray-300 mt-2 text-sm text-center md:text-left italic tracking-wide font-medium">
                            Bringing you closer, one message at a time!
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col md:flex-row items-start gap-2 mt-3 md:mt-0 md:gap-5">
                        <Link to="/" className="hover:text-uiOrange transition">Home</Link>
                        <Link to="/#features" className="hover:text-uiOrange transition">Features</Link>
                        <Link to="#getstarted" className="hover:text-uiOrange transition">Get Started</Link>
                        <Link to="#privacypolicy" className="hover:text-uiOrange transition">Privacy Policy</Link>
                        <Link to="/aboutdev" className="hover:text-uiOrange transition">About Developer</Link>
                    </div>

                </div>

                {/* Copyright Section */}
                <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} ChatIt. All rights reserved.
                </div>
            </section>
        </>
    )
}

export default Footer
