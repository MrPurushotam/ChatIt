import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import initalizeApi from "../utils/Api";
import { useLogout } from '../Hooks/useLogout';

const VerifyEmail = () => {
    const api =initalizeApi();
    const params = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(params.email || "");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60); // Start the cooldown on page load
    const logout = useLogout();
    // Start the countdown as soon as the component mounts
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const sendCode = async () => {
        if (!email) {
            console.log("Email is required.");
            return;
        }
        setLoading(true);
        try {
            const resp = await api.post("/user/verify", { email });
            if (resp.data.success) {
                console.log("Verification code sent.");
                setResendCooldown(60); // Reset the cooldown to 60 seconds
            } else {
                console.log("Error sending code:", resp.data.message);
            }
        } catch (error) {
            console.log("Error while sending code:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!email || code.length !== 6) {
            console.log("Email is required and code should be 6 digits.");
            setLoading(false);
            return;
        }
        try {
            const resp = await api.post("/user/verifyemail", { email, code });
            if (resp.data.success) {
                console.log("Email verified.");
                navigate("/dashboard");
            } else {
                console.log("Email could not be verified:", resp.data.message);
            }
        } catch (error) {
            console.log("Verification error:", error.message);
        } finally {
            setLoading(false);
            setCode('');
        }
    };

    // Check if the user is already verified
    useEffect(() => {
        const getStatus = async () => {
            try {
                const resp = await api.get("/user/");
                if (resp.data.success && resp.data.user.isVerified) {
                    navigate("/dashboard");
                }
            } catch (error) {
                console.log("Error fetching status:", error.message);
            }
        }
        getStatus();
    }, [navigate]);

    // Atom orbit effect (custom cursor)
    useEffect(() => {
        const handleMouseMove = (e) => {
            const cursor = document.querySelector('.custom-cursor');
            cursor.style.left = `${e.pageX - 10}px`;
            cursor.style.top = `${e.pageY - 10}px`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 relative overflow-hidden">
            <button
                onClick={logout}
                className='    absolute bg-red-500 text-white font-semibold tracking-wider px-4 py-2 rounded-md shadow-md text-base sm:text-lg md:text-xl lg:text-2xl top-2 right-4 sm:top-4 sm:right-6 md:top-5 md:right-8 lg:right-10 transition-all duration-300 ease-in-out'>
                Logout
            </button>
            {/* Atom-orbit (custom cursor) */}
            <div className="custom-cursor fixed w-40 h-40 pointer-events-none">
                <div className="atom-orbit">
                    <div className="electron electron-red"></div>
                    <div className="electron electron-blue"></div>
                    <div className="electron electron-green"></div>
                    <div className="electron electron-yellow"></div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-[500px] bg-white p-8 rounded-md shadow-md z-10 relative">
                <h2 className="text-2xl font-bold text-center mb-6">Verify Email</h2>
                <p className='text-gray-800 text-sm tracking-wider my-2 break-words'>
                    We have sent you mail at your provided mail. Please check your spam folder. If you still don't find it, you can request for a resend.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    {/* Email input */}
                    <div className="flex items-center space-x-2 mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            disabled={true} // Make email non-editable
                        />
                        <i className="ml-2 cursor-pointer" title="Email format: user@example.com">ℹ️</i>
                    </div>

                    {/* Verification code input */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value) && value.length <= 6) {
                                    setCode(value);
                                }
                            }}
                            placeholder="Enter verification code"
                            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <i className="ml-2 cursor-pointer" title="Code must be 6 digits">ℹ️</i>
                    </div>

                    {/* Small text for Resend Code with countdown */}
                    <div className="text-right text-gray-600 text-sm">
                        {resendCooldown > 0 ? (
                            <span>Resend Code in {resendCooldown}s</span>
                        ) : (
                            <span onClick={sendCode} className="cursor-pointer text-blue-600 hover:underline">
                                Resend Code
                            </span>
                        )}
                    </div>

                    {/* Verify email button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center rounded-lg bg-gray-900 px-4 py-2 text-center text-base font-semibold text-white shadow-md ring-gray-500 ring-offset-2 transition focus:ring-2 hover:bg-gray-700 disabled:opacity-50"
                        disabled={loading || code.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
