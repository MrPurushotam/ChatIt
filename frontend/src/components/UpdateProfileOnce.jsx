import { useEffect, useRef, useState } from 'react';
import useLoggedUser from '../Hooks/useLoggedUser';
import { useNavigate } from 'react-router-dom';
import initalizeApi from '../utils/Api';
import { fetchUserDetailSelector } from '../states/atoms';
import { useRecoilRefresher_UNSTABLE } from 'recoil';
import Logo from './Logo';
import ToastNotification, { showToast } from './toast';

const UpdateProfileOnce = () => {
    const api = initalizeApi();
    const loggedUser = useLoggedUser();
    const [profile, setProfile] = useState("");
    const [tempFile, setTempFile] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [about, setAbout] = useState("");
    const refreshFetchUserSelctor = useRecoilRefresher_UNSTABLE(fetchUserDetailSelector)
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedUser) {
            setProfile(loggedUser?.profile);
            setDisplayName(loggedUser?.displayName);
            setAbout(loggedUser?.about);
        }
    }, [loggedUser]);

    const handleProfileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setTempFile(imageUrl);
        }
    };
    const handleSkip = () => {
        navigate("/dashboard")
    }
    const handleUpdate = async () => {
        if (!displayName || !about) {
            showToast("Please fill all the fields", "error")
            return;
        }
        if (loggedUser?.displayName === displayName && loggedUser?.about === about && !tempFile) {
            return handleSkip();
        }
        const formData = new FormData();
        formData.append('profile', fileInputRef.current.files[0])
        formData.append('displayName', displayName)
        formData.append('about', about)
        try {
            const response = await api.post("/user/profile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            if (response.data.success) {
                refreshFetchUserSelctor()
                navigate("/dashboard")
            } else {
                showToast(response.data.message, "error");
            }
        } catch (error) {
            console.log("Error occured ", error.message);
            showToast(error.message, "error");
        }
    }

    return (
        <div className="w-full h-full flex justify-center items-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-5 sm:p-10">
            <ToastNotification />
            <div className="border border-gray-300 p-6 space-y-6 min-h-60 h-fit w-full sm:w-2/3 md:w-2/3 lg:w-1/2 max-w-[35rem] rounded-lg shadow-2xl bg-white flex flex-col items-center">
                <div className="text-center">
                    <div className="w-full flex flex-col items-center">
                        <Logo className="inline-block" size="2xl" />
                        <h3 className="text-2xl font-semibold tracking-wide mt-3 border-b-4 border-blue-500 pb-1">
                            Update Profile
                        </h3>
                    </div>
                    <h4 className="text-gray-700 font-medium leading-6 text-base mt-4">
                        Configure your profile details for ChatIt Application. Please make sure you don't upload anything personal as others can view your profile. We respect your privacy and are making efforts to improve it. Thank you for signing in. Hope you have a good time ahead.<br /> Cheers 🥂
                    </h4>
                </div>

                <div className="relative flex justify-center items-center w-36 h-36 cursor-pointer" onClick={handleProfileClick}>
                    {profile || tempFile ? (
                        <img src={tempFile || profile} alt="Profile" className="h-full w-full object-cover rounded-full border-4 border-gray-300" />
                    ) : (
                        <i className="ph-duotone ph-user text-5xl text-gray-400"></i>
                    )}

                    <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
                        {tempFile ? (
                            <i className="ph-duotone ph-trash-simple text-red-500 text-3xl" onClick={() => setTempFile("")}></i>
                        ) : (
                            <i className="ph-duotone ph-pencil text-yellow-500 text-3xl"></i>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="w-full">
                    <h2 className="font-semibold text-[#ee6145] text-lg sm:text-xl">Display Name</h2>
                    <input
                        type="text"
                        placeholder="Enter display name"
                        className="w-full bg-gray-100 text-base sm:text-lg font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 p-3"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <div className="w-full">
                    <h2 className="font-semibold text-[#ee6145] text-lg sm:text-xl">About</h2>
                    <input
                        type="text"
                        placeholder="About you"
                        className="w-full bg-gray-100 text-base sm:text-lg font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 p-3"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className="gap-4 flex flex-col sm:flex-row items-center mt-6 w-full">
                    <button
                        className="bg-sky-600 hover:bg-sky-800 text-white font-bold tracking-wider text-lg px-6 py-3 rounded-md shadow-md transition-all duration-300 w-full sm:w-auto"
                        onClick={handleSkip}
                    >
                        Skip
                    </button>
                    <button
                        className="bg-[#ee6145] hover:bg-[#d14c37] text-white font-bold tracking-wider text-lg px-6 py-3 rounded-md shadow-md transition-all duration-300 w-full sm:w-auto"
                        onClick={handleUpdate}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateProfileOnce;
