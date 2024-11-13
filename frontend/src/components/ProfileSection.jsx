import React, { useEffect, useRef, useState } from 'react'
import { fetchUserDetailSelector, globalLoadingAtom, selectedDropDownItemAtom, viewImageAtom } from '../states/atoms';
import { useRecoilRefresher_UNSTABLE, useRecoilState, useSetRecoilState } from 'recoil';
import useLoggedUser from '../Hooks/useLoggedUser';
import initalizeApi from '../utils/Api';
import Loader from './Loader';
import ProgressiveImage from "./ProgressiveImage";
import { useNavigate } from 'react-router-dom';

const ProfileSection = () => {
    const api = initalizeApi();
    const setSelectedDropdownItem = useSetRecoilState(selectedDropDownItemAtom);
    const setViewImage = useSetRecoilState(viewImageAtom);
    const refreshFetchUserSelctor = useRecoilRefresher_UNSTABLE(fetchUserDetailSelector)
    const [globalLoading, setGlobalLoading] = useRecoilState(globalLoadingAtom);
    const loggedUser = useLoggedUser();
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [name, setName] = useState(loggedUser?.displayName || "");
    const [about, setAbout] = useState(loggedUser?.about || "");
    const [profile, setProfile] = useState(loggedUser?.profile || "");
    const [newProfileImage, setNewProfileImage] = useState(null);
    const [edit, setEdit] = useState("");
    useEffect(() => {
        setName(loggedUser?.displayName || "");
        setAbout(loggedUser?.about || "");
        setProfile(loggedUser?.profile || "");
    }, [loggedUser]);

    const handleSubmit = async () => {
        setGlobalLoading("profile-updation")
        if (edit === "name" && name === loggedUser?.displayName || edit === "about" && about === loggedUser?.about) {
            console.log("No changes to ", edit);
            setEdit("");
            setGlobalLoading("")
            return;
        }

        const formData = new FormData();
        if (edit === "name") {
            formData.append("displayName", name);
        } else if (edit === "about") {
            formData.append("about", about);
        } else if (edit === "profile") {
            formData.append("profile", newProfileImage);
        }


        try {
            const response = await api.post("/user/profile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            if (response.data.success) {
                refreshFetchUserSelctor();
            }
        } catch (error) {
            console.log("Error occurred ", error.message);
        } finally {
            setEdit("");
            setNewProfileImage(null);
            setGlobalLoading("")
        }
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 4 * 1024 * 1024) {
            setProfile(URL.createObjectURL(file));
            setNewProfileImage(file);
            setEdit("profile");
            setGlobalLoading("");
        } else {
            alert("file size exceed 4MB");
            event.target.value = '';
        }
    };

    const handleCancelImage = () => {
        setProfile(loggedUser?.profile);
        setNewProfileImage(null);
        setEdit("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleEdit = (field) => {
        if (edit && edit !== field) {
            setNewProfileImage(null);
            setName(loggedUser?.displayName || "");
            setAbout(loggedUser?.about || "");
        }
        setEdit(field);
        if (field === "profile") {
            setGlobalLoading("newprofile-loading")
            fileInputRef.current?.click();
        }
    };

    return (
        <div className='flex flex-col space-y-6 sm:space-y-8 py-4 sm:py-6'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-gray-900 text-2xl sm:text-3xl'>Profile</h1>
                <i className="ph-duotone ph-arrow-fat-line-left text-xl sm:text-2xl hover:text-[#ee6145] transition-transform transform hover:scale-110 cursor-pointer" onClick={() => setSelectedDropdownItem(null)}></i>
            </div>

            <div className='relative h-32 w-32 sm:h-40 sm:w-40 p-4 sm:p-5 border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg'>
                {(globalLoading === "profile-updation" || globalLoading === "newprofile-loading") && (
                    <div className='absolute inset-0 flex justify-center items-center'>
                        <Loader className="bg-transparent" />
                    </div>
                )}
                {profile ? (
                    <ProgressiveImage src={profile} placeholder="   ">
                        {(src, loading) => (
                            <img
                                src={src}
                                alt={profile}
                                className={`flex justify-center items-center h-full w-full object-cover rounded-full cursor-pointer ${loading ? "blur-sm" : "blur-0"}`}
                                onClick={() => setViewImage(profile)}
                            />
                        )}
                    </ProgressiveImage>
                ) : (
                    <i className="ph-duotone ph-user text-3xl sm:text-4xl"></i>
                )}
            </div>

            <div className='text-center mt-2'>
                {edit === "profile" ? (
                    <div className='flex justify-center space-x-4'>
                        <button className="text-green-500 font-semibold cursor-pointer" onClick={handleSubmit}>
                            Save
                        </button>
                        <button className="text-red-500 font-semibold cursor-pointer" onClick={handleCancelImage}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            className="text-[#ee6145] font-semibold cursor-pointer"
                            onClick={() => handleEdit("profile")}
                        >
                            Edit Image
                        </button>
                    </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={false} onChange={handleImageChange} />
            </div>

            {/* Name Section */}
            <div className='space-y-2 sm:space-y-4'>
                <h2 className='font-semibold text-[#ee6145] text-lg sm:text-xl'>Display Name</h2>
                {edit === "name" ? (
                    <div className='flex items-center space-x-3'>
                        <input type='text' placeholder='Enter your display name'
                            className='flex-1 bg-transparent text-base sm:text-lg font-semibold border-b-2 
                        border-gray-300 focus:outline-none focus:border-[#ee6145] transition-colors duration-300'
                            value={name} onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmit("name")
                                if (e.key === "Escape") setEdit("")
                            }}
                        />
                        <i className="ph-duotone ph-thumbs-up profile-save-icon" onClick={handleSubmit}></i>
                    </div>
                ) : (
                    <div className='flex items-center justify-between'>
                        <h2 className='text-gray-900 font-semibold text-base sm:text-lg px-1'>{name}</h2>
                        <i className="ph-duotone ph-pencil-simple profile-edit-icon"
                            onClick={() => handleEdit("name")}></i>
                    </div>
                )}
            </div>

            {/* About Section - similar structure to Name Section */}
            <div className='space-y-2 sm:space-y-4'>
                <h2 className='font-semibold text-[#ee6145] text-lg sm:text-xl'>About</h2>
                {edit === "about" ? (
                    <div className='flex items-center space-x-3'>
                        <input type="text"
                            className='flex-1 bg-transparent text-base sm:text-lg font-semibold border-b-2 border-gray-300 focus:outline-none focus:border-[#ee6145] transition-colors duration-300'
                            value={about} onChange={(e) => setAbout(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmit()
                                if (e.key === "Escape") setEdit("")
                            }}
                        />
                        <i className="ph-duotone ph-thumbs-up profile-save-icon" onClick={handleSubmit}></i>
                    </div>
                ) : (
                    <div className='flex items-center justify-between'>
                        <h2 className='text-gray-900 font-semibold text-base sm:text-lg px-1'>{about}</h2>
                        <i className="ph-duotone ph-pencil-simple profile-edit-icon"
                            onClick={() => handleEdit("about")}></i>
                    </div>
                )}
            </div>

            {loggedUser?.email && <div className='space-y-2 sm:space-y-4'>
                <h2 className='font-semibold text-[#ee6145] text-lg sm:text-xl'>Your Email</h2>
                <div className='flex items-center justify-between'>
                    <h2 className='text-gray-900 font-semibold text-base sm:text-lg px-1'>{loggedUser?.email}</h2>
                    {loggedUser?.isVerified && <i className="ph-duotone ph-seal-check text-2xl text-green-700 "></i>}
                    {!loggedUser?.isVerified && <i className="ph-duotone ph-seal-warning text-2xl text-red-700" onClick={()=>navigate(`/verify/${loggedUser?.email}`)}></i>}
                </div>
            </div>}
        </div>
    )
}

export default ProfileSection;
