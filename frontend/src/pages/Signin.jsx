import { Link, useNavigate } from 'react-router-dom'
import initalizeApi from '../utils/Api';
import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authenticatedAtom } from '../states/atoms';
import ToastNotification, { showToast } from '../components/toast';
import Loader from '../components/Loader'; // Import the Loader component

const Signin = () => {

    const api = initalizeApi();
    const navigate = useNavigate();
    const [formdata, setFormdata] = useState({ email: "", password: "", username: "" });
    const [signup, setSignup] = useState(false);
    const setAuthenticated = useSetRecoilState(authenticatedAtom);

    const [validEmail, setValidEmail] = useState(false);
    const [validCode, setValidCode] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [validUsername, setValidUsername] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false); // State for forgot password flow
    const [codeSent, setCodeSent] = useState(false); // Track if code was sent
    const [resendCooldown, setResendCooldown] = useState(0);
    const [loading, setLoading] = useState(false); // State for loading


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{6,}$/;
    const codeRegex = /^\d{6}$/

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!emailRegex.test(formdata.email)) {
            alert("Please enter a valid email");
            return;
        }

        if (forgotPassword) {
            try {
                const resp = await api.post("/user/forgotpassword", ({ email: formdata.email }))
                if (resp.data.success) {
                    setCodeSent(true);
                    setResendCooldown(60);

                    showToast("Verification code sent to your email", "success");
                } else {
                    showToast(resp.data.message, "error");
                }
            } catch (error) {
                console.log("Error occured while processing forgot password request.", error.message);
                showToast("Error occurred while processing forgot password request.", "error");
            }
        }
    }
    const handleResendCode = async (e) => {
        e.preventDefault();
        if (setResendCooldown > 0) return;
        if (!emailRegex.test(formdata.email)) {
            showToast("Please enter a valid email", "error");
            return;
        }
        try {
            const resp = await api.post("/user/forgotpassword", { email: formdata.email })
            if (resp.data.success) {
                setResendCooldown(60);
                showToast("Verification code resent to your email", "success");
            } else {
                showToast(resp.data.message, "error");
            }

        } catch (error) {
            console.log("Error occured while processing resend mail request.", error.message);
            showToast("Error occurred while processing resend mail request.", "error");

        }
    }

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        try {
            if (!formdata.code || !validPassword) {
                showToast("Please provide a valid 6-digit code and a valid password.", "error");
                return;
            }
            const resp = await api.post("/user/verifypassword", { email: formdata.email, code: formdata.code, password: formdata.password });
            if (resp.data.success) {
                setForgotPassword(false);
                showToast("Password updated! Please log in.", "success");
                navigate("/login");
            } else {
                showToast(resp.data.message, "error");
            }
        } catch (error) {
            console.log("Error verifying code:", error.message);
            showToast("Error verifying code.", "error");
        }
    };
    const submit = async (e) => {
        e.preventDefault();

        if (!validEmail || (signup && !validPassword) || (signup && !validUsername)) {
            showToast("Please correct the fields with errors.", "error");
            return;
        }

        if (signup) {
            alert("Are you sure about your password? It's " + formdata.password);
        }

        setLoading(true); // Set loading to true
        try {
            const endpoint = signup ? "/user/signup" : "/user/login";
            const resp = await api.post(endpoint, formdata);

            if (resp.data.success) {
                setAuthenticated(true);
                window.localStorage.setItem("token", resp.data.token);
                if (signup) {
                    showToast("Signup successful! Please verify your email.", "success");
                    navigate(`/verify/${formdata.email}`);
                } else {
                    showToast("Login successful! Redirecting to dashboard.", "success");
                    navigate(`/dashboard`);
                }
            } else {
                showToast(resp.data.message, "error");
                console.log("Some error occurred");
            }
        } catch (e) {
            console.log("Error occurred:", e.message);
            showToast(e.message, "error");
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setFormdata(prev => ({ ...prev, email: value }));
        setValidEmail(emailRegex.test(value));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormdata(prev => ({ ...prev, password: value }));
        if (signup) {
            setValidPassword(passwordRegex.test(value));
        } else {
            setValidPassword(value.length > 0)
        }
    };
    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setFormdata(prev => ({ ...prev, username: value }));
        setValidUsername(usernameRegex.test(value));
    };

    const handleCodeChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            setFormdata(prev => ({ ...prev, code: value }));
            setValidCode(codeRegex.test(value));
        }
    };
    return (
        <div className="w-full h-auto mt-4 py-4 pxbg-gray-200 flex justify-center items-center">
            <div className="relative w-[580px] min-h-[750px] h-auto bg-gray-100 rounded-lg shadow-lg flex flex-col justify-normal items-center px-8 my-5">
                <div className="flex justify-center mt-6 mb-3">
                    <Link to="/" className="border-b-gray-700 border-b-4 pb-2 text-2xl font-bold text-gray-900">
                        Chat<span className='text-yellow-500 font-bold text-3xl'>I</span>T

                    </Link>
                </div>
                <ToastNotification />
                <p className='block text-sm font-semibold text-gray-900 tracking-normal w-10/12 shadow-md shadow-yellow-500 p-2 rounded-md'> Welcome to ChatIt, your ultimate chat application. Sign up or log in to connect effortlessly with friends and family.</p>

                {/* <hr className="border-2 border-dashed border-orange-500 w-9/12 mt-6" /> */}

                <div className='my-4 w-10/12 lg:w-[28rem] p-2'>
                    <div className="mx-auto my-auto flex flex-col justify-center pt-8 md:justify-start md:px-6 md:pt-0">
                        <p className="text-center text-3xl font-bold my-3">{forgotPassword ? "Reset Password" : signup ? "Signup" : "Login"}</p>

                        {forgotPassword ?
                            <form className="flex flex-col pt-3 md:pt-8" onSubmit={(e) => codeSent ? handleVerifyCode(e) : handleForgotPassword(e)}>
                                <div className="flex flex-col pt-4">
                                    <div className={` relative flex items-center overflow-hidden border-b-2 transition ${validEmail ? 'border-green-500' : 'border-red-500'}`}>
                                        <input
                                            type="email"
                                            id="email"
                                            className={`w-full flex-1 appearance-none  bg-transparent px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none ${validEmail ? 'border-green-500' : 'border-red-500'}`}
                                            placeholder="Email"
                                            value={formdata.email}
                                            onChange={handleEmailChange}
                                        />
                                        <div className="relative group">
                                            <i
                                                className="ph-duotone ph-info text-2xl ml-2 cursor-pointer"
                                                title="Email  must be a valid email format, e.g., user@example.com."
                                            >
                                            </i>

                                        </div>
                                    </div>
                                    {!validEmail && (
                                        <p className="mt-2 text-sm text-red-500">
                                            Please enter a valid email format (e.g., user@example.com).
                                        </p>
                                    )}
                                </div>

                                {codeSent &&
                                    <>
                                        <div className="flex flex-col pt-4">
                                            <div className={` relative flex items-center overflow-hidden border-b-2 transition ${validCode ? 'border-green-500' : 'border-red-500'}`}>
                                                <input
                                                    type="text"
                                                    id="forgotpassword-code"
                                                    className="w-full flex-1 appearance-none bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                                    placeholder="XXXXXX"
                                                    value={formdata.code}
                                                    onChange={handleCodeChange}
                                                />
                                                <i className="ph-duotone ph-info text-2xl ml-2 cursor-pointer" title="Verification Code should be of only 6 digit number."></i>
                                            </div>
                                            {!validCode && (
                                                <p className="mt-2 text-sm text-red-500">
                                                    Please enter a valid code format (eg. XXXXXX).
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col pt-4">
                                            <div className={`focus-within:border-b-gray-500 relative flex items-center overflow-hidden border-b-2 transition ${validPassword ? 'border-green-500' : 'border-red-500'}`}>
                                                <input
                                                    type="password"
                                                    id="newpassword"
                                                    className="w-full flex-1 appearance-none bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                                    placeholder="New Password"
                                                    value={formdata.password}
                                                    onChange={handlePasswordChange}
                                                />

                                                <i className="ph-duotone ph-info text-2xl ml-2 cursor-pointer" title="Password must be at least 8 characters, contain one uppercase letter, one number, and one special character"></i>
                                            </div>
                                            {!validPassword && (
                                                <p className="mt-2 text-sm text-red-500">
                                                    Please enter a valid password format (Must contain a capital letter, one number,one special character finally should be of 8 letters).
                                                </p>
                                            )}
                                        </div>
                                    </>
                                }
                                {
                                    forgotPassword &&
                                    <div className='flex justify-between items-center my-4'>
                                        <div className='flex justify-end items-center my-4'>
                                            <Link
                                                className='text-sm text-semibold tracking-wider text-red-600 hover:text-red-800 hover:bg-red-100/50 p-1'
                                                onClick={() => {
                                                    setFormdata({ email: "", code: "", password: "", username: "" })
                                                    setCodeSent(false);
                                                    setForgotPassword(false);
                                                }}>Cancel❌
                                            </Link>
                                        </div>

                                        {codeSent && resendCooldown > 0 && (
                                            <p className='text-sm tracking-wider text-gray-800 hover:bg-gray-100/70 cursor-pointer p-1'>Resend code in {resendCooldown} seconds</p>
                                        )}
                                        {codeSent && resendCooldown === 0 && (
                                            <Link className='text-sm tracking-wider text-sky-800 hover:text-sky-900 hover:bg-sky-200/70 p-1 ' onClick={handleResendCode}>Resend Code</Link>
                                        )}
                                    </div>
                                }

                                <button
                                    type="submit"
                                    className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-base font-semibold text-white shadow-md ring-gray-500 ring-offset-2 transition focus:ring-2">
                                    {codeSent ? "Update Password" : "Send Verification Code"}
                                </button>
                            </form>
                            :
                            <form className="flex flex-col pt-3 md:pt-8" onSubmit={submit}>
                                <div className="flex flex-col pt-4">
                                    <div className={`relative flex items-center overflow-hidden border-b-2 transition ${validEmail ? 'border-green-500' : 'border-red-500'}`}>
                                        <input
                                            type="email"
                                            id="login-email"
                                            className={`w-full flex-1 appearance-none bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none ${validEmail ? 'border-green-500' : 'border-red-500'}`}
                                            placeholder="Email"
                                            value={formdata.email}
                                            onChange={handleEmailChange}
                                        />
                                        <i className="ph-duotone ph-info text-2xl ml-2 cursor-pointer" title="Must be a valid email format (e.g., user@example.com)"></i>
                                    </div>
                                    {!validEmail && (
                                        <p className="mt-2 text-sm text-red-500">
                                            Please enter a valid email format (e.g., user@example.com).
                                        </p>
                                    )}
                                </div>
                                {signup && (
                                    <div className="flex flex-col pt-4">
                                        <div className={`relative flex items-center overflow-hidden border-b-2 transition ${validUsername ? 'border-green-500' : 'border-red-500'}`}>
                                            <input
                                                type="text"
                                                id="username"
                                                className="w-full flex-1 appearance-none bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                                placeholder="Username"
                                                value={formdata.username}
                                                onChange={handleUsernameChange}
                                            />
                                            <i className="ph-duotone ph-info text-2xl ml-2 cursor-pointer" title="Username must be at least 6 characters long and contain no special characters except underscores"></i>
                                        </div>
                                        {!validUsername && (
                                            <p className="mt-2 text-sm text-red-500">
                                                Please enter a valid username format (Username must be at least 6 characters long and contain no special characters except underscores).
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="flex flex-col pt-4">
                                    <div className={`relative flex items-center overflow-hidden border-b-2 transition ${validPassword ? 'border-green-500' : 'border-red-500'} `}>
                                        <input
                                            type="password"
                                            id="login-password"
                                            className="w-full flex-1 appearance-none bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                            placeholder="Password"
                                            value={formdata.password}
                                            onChange={handlePasswordChange}
                                        />
                                        <i className="text-2xl ml-2 cursor-pointer ph-duotone ph-info" title="Password must be at least 8 characters, contain one uppercase letter, one number, and one special character"></i>
                                    </div>
                                    {!validPassword && signup && (
                                        <p className="mt-2 text-sm text-red-500">
                                            Please enter a valid password format (Must contain a capital letter, one number,one special character finally should be of 8 letters).
                                        </p>
                                    )}
                                </div>
                                {
                                    !signup &&
                                    <div className='flex justify-end items-center my-4'>
                                        <Link
                                            className='text-sm tracking-wider text-sky-800 hover:text-sky-900  '
                                            onClick={() => {
                                                setFormdata({ email: "", code: "", password: "", username: "" })
                                                setCodeSent(false);
                                                setForgotPassword(true);
                                            }}>Forgot Password</Link>
                                    </div>
                                }
                                <button
                                    type="submit"
                                    className="mt-8 w-full flex justify-center items-center rounded-lg bg-gray-900 px-4 py-2 text-base font-semibold text-white shadow-md ring-gray-500 ring-offset-2 transition focus:ring-2">
                                    {loading ? <Loader size={'xs'} color="#fff" /> : (signup ? "Sign up" : "Log in")}
                                </button>
                            </form>
                        }
                        <div className="py-10 text-center">
                            <p className="whitespace-nowrap text-gray-600">
                                {!signup ? (
                                    <>
                                        Don't have an account?
                                        <span
                                            className="underline-offset-4 font-semibold text-gray-900 underline cursor-pointer"
                                            onClick={() => {
                                                setFormdata({ email: "", password: "", username: "", code: "" });
                                                setValidEmail(false);
                                                setValidCode(false);
                                                setValidPassword(false);
                                                setValidUsername(false);
                                                setForgotPassword(false);
                                                setCodeSent(false);
                                                setResendCooldown(0);
                                                setSignup(true);
                                            }}>
                                            Sign up for free.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?
                                        <span
                                            className="underline-offset-4 font-semibold text-gray-900 underline cursor-pointer"
                                            onClick={() => {
                                                setFormdata({ email: "", password: "", username: "", code: "" });
                                                setValidEmail(false);
                                                setValidCode(false);
                                                setValidPassword(false);
                                                setValidUsername(false);
                                                setForgotPassword(false);
                                                setCodeSent(false);
                                                setResendCooldown(0);
                                                setSignup(false);
                                            }}>
                                            Login
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Signin
