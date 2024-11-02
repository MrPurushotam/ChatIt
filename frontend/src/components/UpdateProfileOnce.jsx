import React, { useEffect, useRef, useState } from 'react';
import useLoggedUser from '../Hooks/useLoggedUser';
import { useNavigate } from 'react-router-dom';
import initalizeApi from '../utils/Api';
import { fetchUserDetailSelector} from '../states/atoms';
import { useRecoilRefresher_UNSTABLE} from 'recoil';

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
            console.log("Please fill all the fields");
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
                console.log(response.data.message);
            }
        } catch (error) {
            console.log("Error occured ", error.message);
        }
    }

    return (
        <div className='w-full h-full flex justify-center p-5 sm:p-10'>
            <div className='border-2 border-gray-800 p-4 space-y-5 min-h-60 h-fit w-full sm:w-2/3 md:w-1/2 lg:w-1/3 rounded-md shadow-lg flex flex-col items-center justify-center bg-white'>
                <div className='text-center'>
                    <p className='text-2xl font-bold text-black tracking-wider'>
                        Chat<span className="font-bold mx-1 text-yellow-500 text-3xl">I</span>t Profile
                    </p>
                    <h4 className='text-gray-700 text-sm tracking-wider mt-2'>
                        {/* Configure your profile details for the ChatIt Application. Please ensure you don't upload anything personal, as others can view your profile. We respect your privacy and strive to improve it every day. */}
                        Configure your profile details for ChatIt Application. Please make sure you don't upload anything personal anybody can search and view your profile. We respect your privacy and making efforts to improve it everyday. Thankyou for signing in, Hope you have a crazy time ahead. Cheers🥂
                    </h4>
                </div>

                <div className='relative flex justify-center items-center w-36 h-36 cursor-pointer' onClick={handleProfileClick}>
                    {profile || tempFile ? (
                        <img src={tempFile || profile} alt="Profile" className='h-full w-full object-cover rounded-full' />
                    ) : (
                        <i className="ph-duotone ph-user text-4xl"></i>
                    )}

                    <div className='absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300'>
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

                <div className='w-full'>
                    <h2 className='font-semibold text-[#ee6145] text-lg sm:text-xl'>Display Name</h2>
                    <input
                        type='text'
                        placeholder='Enter display name'
                        className='w-full bg-transparent text-base sm:text-lg font-semibold border-b-2 border-gray-300 focus:outline-none focus:border-yellow-500 transition-colors duration-300 p-2'
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <div className='w-full'>
                    <h2 className='font-semibold text-[#ee6145] text-lg sm:text-xl'>About</h2>
                    <input
                        type="text"
                        placeholder="About you"
                        className='w-full bg-transparent text-base sm:text-lg font-semibold border-b-2 border-gray-300 focus:outline-none focus:border-yellow-500 transition-colors duration-300 p-2'
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className='gap-3 flex flex-col sm:flex-row items-center mt-5'>
                    <button className="bg-[#ee6145] hover:bg-[#d14c37] text-white font-bold tracking-wider text-lg px-6 py-2 rounded-md shadow-md transition-all duration-300 w-full sm:w-auto"
                        onClick={handleUpdate}>
                        Update
                    </button>
                    <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold tracking-wider text-lg px-6 py-2 rounded-md shadow-md transition-all duration-300 w-full sm:w-auto"
                        onClick={handleSkip}>
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateProfileOnce;
