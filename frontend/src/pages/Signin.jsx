/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/Api";
import { useSetRecoilState } from 'recoil';
import { authenticatedAtom } from '../states/atoms';

const SigninPage = () => {
    const navigate = useNavigate();
    const [formdata, setFormdata] = useState({ email: "", password: "", username: "" });
    const [signup, setSignup] = useState(false);
    const setAuthenticated = useSetRecoilState(authenticatedAtom);

    const [validEmail, setValidEmail] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [validUsername, setValidUsername] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false); // State for forgot password flow
    const [codeSent, setCodeSent] = useState(false); // Track if code was sent
    const [resendCooldown, setResendCooldown] = useState(0);


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{6,}$/;

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
                } else {
                    console.log(resp.data.message);
                }
            } catch (error) {
                console.log("Error occured while processing forgot password request.", error.message)
            }
        }
    }
    const handleResendCode = async (e) => {
        e.preventDefault();
        if (setResendCooldown > 0) return;
        if (!emailRegex.test(formdata.email)) {
            console.log("Please enter a valid email");
            return;
        }
        try {
            const resp = await api.post("/user/forgotpassword", { email: formdata.email })
            if (resp.data.success) {
                setResendCooldown(60);
            } else {
                console.log(resp.data.message);
            }

        } catch (error) {
            console.log("Error occured while processing resend mail request.", error.message)

        }
    }

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        try {
            if (!formdata.code || !validPassword) {
                alert("Please provide a valid 6-digit code and a valid password.");
                return;
            }
            const resp = await api.post("/user/verifypassword", { email: formdata.email, code: formdata.code, password: formdata.password });
            if (resp.data.success) {
                console.log("Password Updated! Please log in.");
                setVerificationMode(false);
                setForgotPassword(false);
                navigate("/login");
            } else {
                console.log(resp.data.message);
            }
        } catch (error) {
            console.log("Error verifying code:", error.message);
            alert("Error verifying code.");
        }
    };
    const submit = async (e) => {
        e.preventDefault();

        if (!validEmail || (signup && !validPassword) || (signup && !validUsername)) {
            alert("Please correct the fields with errors.");
            return;
        }

        if (signup) {
            alert("Are you sure about your password? It's " + formdata.password);
        }

        try {
            const endpoint = signup ? "/user/signup" : "/user/login";
            const resp = await api.post(endpoint, formdata);

            if (resp.data.success) {
                setAuthenticated(true);
                if (signup) {
                    navigate(`/verify/${formdata.email}`);
                } else {
                    navigate(`/dashboard`);
                }
            } else {
                alert(resp.data.message);
                console.log("Some error occurred");
            }
        } catch (e) {
            console.log("Error occurred:", e.message);
            alert(e.message);
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
        setValidPassword(passwordRegex.test(value));
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setFormdata(prev => ({ ...prev, username: value }));
        setValidUsername(usernameRegex.test(value));
    };

    const handleCodeChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            setFormdata(prev=>({...prev,code:value}));
            console.log("works")
        }
    };

    return (
        <div className="flex flex-wrap">
            <div className="flex w-full flex-col md:w-1/2">
                <div className="flex justify-center pt-12 md:-mb-24 md:justify-start md:pl-12">
                    <Link to="/" className="border-b-gray-700 border-b-4 pb-2 text-2xl font-bold text-gray-900">
                        Chat<span className='text-yellow-500 font-bold text-3xl'>I</span>T
                    </Link>
                </div>
                <div className="lg:w-[28rem] mx-auto my-auto flex flex-col justify-center pt-8 md:justify-start md:px-6 md:pt-0">
                    <p className="text-center text-3xl font-bold">Welcome {forgotPassword ? "Password Rest" : signup ? "Singup" : "Signin"} Here </p>

                    {forgotPassword ?
                        <form className="flex flex-col pt-3 md:pt-8" onSubmit={(e) => codeSent ? handleVerifyCode(e) : handleForgotPassword(e)}>
                            <div className="flex flex-col pt-4">
                                <div className="focus-within:border-b-gray-500 relative flex overflow-hidden border-b-2 transition">
                                    <input
                                        type="email"
                                        id="email"
                                        className={`w-full flex-1 appearance-none border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none ${validEmail ? 'border-green-500' : 'border-red-500'}`}
                                        placeholder="Email"
                                        value={formdata.email}
                                        onChange={handleEmailChange}
                                    />
                                    <span className="ml-2">{validEmail ? '✅' : '❌'}</span>
                                    <i className="ml-2 cursor-pointer" title="Must be a valid email format (e.g., user@example.com)">ℹ️</i>
                                </div>
                            </div>

                            {codeSent &&
                                <>
                                    <div className="flex flex-col pt-4">
                                        <div className="focus-within:border-b-gray-500 relative flex overflow-hidden border-b-2 transition">
                                            <input
                                                type="text"
                                                id="forgotpassword-code"
                                                className="w-full flex-1 appearance-none border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                                placeholder="XXXXXX"
                                                value={formdata.code}
                                                onChange={handleCodeChange}
                                            />
                                            <span className="ml-2">{validPassword ? '✅' : '❌'}</span>
                                            <i className="ml-2 cursor-pointer" title="Verification Code should be of only 6 digit number.">ℹ️</i>
                                        </div>
                                    </div>
                                    <div className="flex flex-col pt-4">
                                        <div className="focus-within:border-b-gray-500 relative flex overflow-hidden border-b-2 transition">
                                            <input
                                                type="password"
                                                id="newpassword"
                                                className="w-full flex-1 appearance-none border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                                placeholder="New Password"
                                                value={formdata.password}
                                                onChange={handlePasswordChange}
                                            />
                                            <span className="ml-2">{validPassword ? '✅' : '❌'}</span>
                                            <i className="ml-2 cursor-pointer" title="Password must be at least 8 characters, contain one uppercase letter, one number, and one special character">ℹ️</i>
                                        </div>
                                    </div>
                                </>}
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
                                            }}>Cancle❌
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
                                <div className="focus-within:border-b-gray-500 relative flex overflow-hidden border-b-2 transition">
                                    <input
                                        type="email"
                                        id="login-email"
                                        className={`w-full flex-1 appearance-none border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none ${validEmail ? 'border-green-500' : 'border-red-500'}`}
                                        placeholder="Email"
                                        value={formdata.email}
                                        onChange={handleEmailChange}
                                    />
                                    <span className="ml-2">{validEmail ? '✅' : '❌'}</span>
                                    <i className="ml-2 cursor-pointer" title="Must be a valid email format (e.g., user@example.com)">ℹ️</i>
                                </div>
                            </div>
                            {signup && (
                                <div className="flex flex-col pt-4">
                                    <div className="focus-within:border-b-gray-500 relative flex overflow-hidden border-b-2 transition">
                                        <input
                                            type="text"
                                            id="username"
                                            className="w-full flex-1 appearance-none border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                            placeholder="Username"
                                            value={formdata.username}
                                            onChange={handleUsernameChange}
                                        />
                                        <span className="ml-2">{validUsername ? '✅' : '❌'}</span>
                                        <i className="ml-2 cursor-pointer" title="Username must be at least 6 characters long and contain no special characters except underscores">ℹ️</i>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col pt-4">
                                <div className="focus-within:border-b-gray-500 relative flex overflow-hidden border-b-2 transition">
                                    <input
                                        type="password"
                                        id="login-password"
                                        className="w-full flex-1 appearance-none border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                        placeholder="Password"
                                        value={formdata.password}
                                        onChange={handlePasswordChange}
                                    />
                                    <span className="ml-2">{validPassword ? '✅' : '❌'}</span>
                                    <i className="ml-2 cursor-pointer" title="Password must be at least 8 characters, contain one uppercase letter, one number, and one special character">ℹ️</i>
                                </div>
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
                                className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-base font-semibold text-white shadow-md ring-gray-500 ring-offset-2 transition focus:ring-2">
                                {signup ? "Sign up" : "Log in"}
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
                                            setForgotPassword(false);
                                            setCodeSent(false);
                                            setResendCooldown(0);
                                            setSignup(false);
                                        }}>
                                        Login?
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
            <div className="pointer-events-none relative hidden h-screen select-none bg-black md:block md:w-1/2">
                <div className="absolute bottom-0 z-10 px-8 text-orange-400 opacity-100">
                    <p className="mb-8 text-3xl font-semibold leading-10">
                        A lot of problems in the world would be solved if we talked to each other instead of about each other
                    </p>
                    <p className="mb-4 text-3xl font-semibold">-Nicky Gumbel</p>
                </div>
                <img
                    className="-z-1 absolute top-0 h-full w-full object-cover opacity-90"
                    src="https://images.unsplash.com/photo-1565301660306-29e08751cc53?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                    alt="Background"
                />
            </div>
        </div>
    );
};

export default SigninPage;
