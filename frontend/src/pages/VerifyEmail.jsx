import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import initalizeApi from "../utils/Api";
import { useLogout } from '../Hooks/useLogout';
import ToastNotification, { showToast } from '../components/toast';
import Loader from '../components/Loader';
import { fetchUserDetailSelector, loggedUserAtom } from '../states/atoms';
import useDebounce from '../Hooks/useDebounce';
import { useRecoilRefresher_UNSTABLE, useResetRecoilState } from 'recoil';

const VerifyEmail = () => {
    const api = initalizeApi();
    const params = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(() => params.email || "");
    const [code, setCode] = useState("");
    const [validCode, setValidCode] = useState(false)
    const [loading, setLoading] = useState("");
    const [resendCooldown, setResendCooldown] = useState(60); // Start the cooldown on page load
    const logout = useLogout();
    const codeRegex = /^\d{6}$/;
    const resetLoggedUser = useResetRecoilState(loggedUserAtom);
    const resetFetchUserDetailsSelector = useRecoilRefresher_UNSTABLE(fetchUserDetailSelector);


    // Start the countdown as soon as the component mounts
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const sendCode = useDebounce(useCallback(async (type = "send-otp") => {
        if (!email) {
            showToast("Email is required.", "error");
            return;
        }
        setLoading(type);
        try {
            const resp = await api.post("/user/verify", { email });
            if (resp.data.success) {
                showToast("Verification code sent.", "success");
                setResendCooldown(60); // Reset the cooldown to 60 seconds
            } else {
                showToast(`Error sending code: ${resp.data.message}`, "error");
            }
        } catch (error) {
            showToast(`Error while sending code: ${error.message}`, "error");
        } finally {
            setLoading("");
        }
    }, [email]), 3000)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading("verify");
        if (!email || code.length !== 6) {
            showToast("Email is required and code should be 6 digits.", "error");
            setLoading("");
            return;
        }
        try {
            const resp = await api.post("/user/verifyemail", { email, code });
            if (resp.data.success) {
                setCode('');
                // Set loading state to prevent additional API calls during redirect
                window.localStorage.setItem("token", resp.data.token);
                showToast("Email verified successfully!", "success");
                resetFetchUserDetailsSelector();
                resetLoggedUser();
                navigate("/dashboard", { replace: true });
            } else {
                showToast(`Email could not be verified: ${resp.data.message}`, "error");
            }
        } catch (error) {
            showToast(`Verification error: ${error.message}`, "error");
        } finally {
            setLoading("");
        }
    };

    // Check if the user is already verified
    useEffect(() => {
        const getStatus = async () => {
            setLoading("get-status");
            try {
                const resp = await api.get("/user/");
                if (resp.data.success && resp.data.user.isVerified) {
                    navigate("/dashboard", { replace: true });
                }
            } catch (error) {
                showToast(`Error fetching status: ${error.message}`, "error");
            } finally {
                setLoading("");
            }
        }

        const token = window.localStorage.getItem("token");
        if (token && loading !== "get-status" && loading !== "redirecting") {
            getStatus();
        }

    }, []);

    return (
        <>
            <ToastNotification />

            <div className="flex items-center justify-center h-screen bg-gray-100 relative overflow-hidden">
                <button
                    onClick={logout}
                    className='absolute bg-red-500 text-white font-semibold tracking-wider px-4 py-2 rounded-md shadow-md text-base sm:text-lg md:text-xl lg:text-2xl top-2 right-4 sm:top-4 sm:right-6 md:top-5 md:right-8 lg:right-10 transition-all duration-300 ease-in-out'>
                    Logout
                </button>
                {/* Circular Rings */}
                <div className="absolute rounded-full border-4 border-gray-300 w-[250px] h-[250px] right-[-75px] top-[50%] translate-y-[-50%]"></div>
                <div className="absolute rounded-full border-4 border-cyan-400 w-[300px] h-[300px] right-[-100px] top-[50%] translate-y-[-50%]"></div>
                <div className="absolute rounded-full border-4 border-yellow-400 w-[350px] h-[350px] right-[-125px] top-[50%] translate-y-[-50%]"></div>

                {/* Oscillating Ball */}
                <div className="absolute bg-orange-500 w-[40px] h-[40px] rounded-full right-[15%] top-[50%] animate-bounce"></div>

                {/* Circular Rings */}
                <div className="absolute rounded-full border-4 border-gray-300 w-[250px] h-[250px] left-[-75px] top-[50%] translate-y-[-50%]"></div>
                <div className="absolute rounded-full border-4 border-cyan-400 w-[300px] h-[300px] left-[-100px] top-[50%] translate-y-[-50%]"></div>
                <div className="absolute rounded-full border-4 border-yellow-400 w-[350px] h-[350px] left-[-125px] top-[50%] translate-y-[-50%]"></div>

                {/* Oscillating Ball */}
                <div className="absolute bg-orange-500 w-[40px] h-[40px] rounded-full left-[15%] top-[50%] animate-bounce"></div>


                {/* Main content */}
                <div className="max-w-[500px] bg-white p-8 rounded-md shadow-md z-10 relative">
                    <h2 className="text-2xl font-bold text-center mb-6 tracking-wide">Verify Email</h2>
                    <p className='text-gray-800 text-sm tracking-wider my-2 break-words'>
                        We have sent you mail at your provided mail. Please check your spam folder. If you still don't find it, you can request for a resend mail. The email would be from purushotamjeswani (ignore my unprofessionalism)
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                        {/* Email input */}
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                disabled={true}
                            />
                        </div>

                        {/* Verification code input */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    if (/^\d*$/.test(value) && value.length <= 6) {
                                        setCode(value);
                                        setValidCode(codeRegex.test(value));
                                    }
                                }}
                                placeholder="Enter verification code"
                                className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        {!validCode && (
                            <p className="mt-2 text-sm text-red-500">
                                Please enter a valid code format (eg. XXXXXX).
                            </p>
                        )}

                        {/* Small text for Resend Code with countdown */}
                        <div className="text-right text-gray-600 text-sm">
                            {resendCooldown > 0 ? (
                                <span>Resend Code in {resendCooldown}s</span>
                            ) : (
                                <span onClick={() => sendCode("resend-otp")} className="cursor-pointer text-blue-600 hover:underline">
                                    {loading === "resend-otp" ? <Loader size='xs' className='inline-block' color='#FF7700' /> : "Resend Code"}
                                </span>
                            )}
                        </div>

                        {/* Verify email button */}
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center rounded-lg bg-gray-900 px-4 py-2 text-center text-base font-semibold text-white shadow-md ring-gray-500 ring-offset-2 transition focus:ring-2 hover:bg-gray-700 disabled:opacity-50"
                            disabled={loading || code.length !== 6}
                        >
                            {loading === "verify" ? <Loader size='sm' color="white" /> : 'Verify Email'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default VerifyEmail;
