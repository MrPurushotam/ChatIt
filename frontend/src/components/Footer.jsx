import { Link } from 'react-router-dom'
import Logo from './Logo'

const Footer = () => {
    return (
        <footer className="w-full bg-neutral-900 text-white py-8" id="footer">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col">
                        <Logo className="text-white text-3xl font-bold bg-white w-fit inline" />
                        <p className="text-gray-300 mt-3 text-sm">
                            Bringing you closer, one message at a time!
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="https://www.linkedin.com/in/purushotamjeswani/" target='_blank' className="text-gray-400 hover:text-orange-500 transition-colors duration-300">
                                <i className="ph-duotone ph-linkedin-logo text-2xl"></i>
                            </a>
                            <a href="https://x.com/purushotam___j" target='_blank' className="text-gray-400 hover:text-orange-500 transition-colors duration-300">
                                <i className="ph-duotone ph-x-logo text-2xl"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-medium mb-4">Quick Links</h3>
                        <div className="flex flex-col space-y-2 ml-2">
                            <Link to="/" className="text-gray-300 hover:text-orange-500 transition-colors duration-300">
                                Home
                            </Link>
                            <Link to="/#features" className="text-gray-300 hover:text-orange-500 transition-colors duration-300">
                                Features
                            </Link>
                            <Link to="/#getstarted" className="text-gray-300 hover:text-orange-500 transition-colors duration-300">
                                Get Started
                            </Link>
                            <Link to="/privacypolicy" className="text-gray-300 hover:text-orange-500 transition-colors duration-300">
                                Privacy Policy
                            </Link>
                            <Link to="/aboutdev" className="text-gray-300 hover:text-orange-500 transition-colors duration-300">
                                About Developer
                            </Link>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold tracking-wide mb-4 ">Contact Us</h3>
                        <p className="text-gray-300 mb-2 ml-2">Email: <span className="italic font-medium tracking-wide text-base underline">work.purushotam@gmail.com</span></p>
                        {/* <button className="mt-3 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition duration-300 shadow-md w-fit">
                            Contact Us
                        </button> */}
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
                    <p>© {new Date().getFullYear()} ChatIt. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
