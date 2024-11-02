import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { disconnectSocketAtom, globalLoadingAtom, selectedDropDownItemAtom } from '../states/atoms';
import { useLogout } from '../Hooks/useLogout';
import Loader from './Loader';

const OptionsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropDownRef = useRef();
    const setDropDownItem = useSetRecoilState(selectedDropDownItemAtom);
    const setDisconnectSocket = useSetRecoilState(disconnectSocketAtom);
    const logout = useLogout();
    const [globalLoading, setGlobalLoading] = useRecoilState(globalLoadingAtom);
    const handleClickOutsideDropdown = useCallback((e) => {
        if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    }, []);

    const handleClickOptions = useCallback((optionType) => {
        setDropDownItem(optionType);
        setIsOpen(false);
    }, [setDropDownItem]);

    const handleLogout = () => {
        setGlobalLoading("logout")
        setDisconnectSocket(true)
        logout();
        setGlobalLoading("")
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutsideDropdown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDropdown);
        }
    }, [])

    return (
        <div className='dropdown' ref={dropDownRef}>
            <i className={`ph-duotone ph-gear text-3xl p-2 cursor-pointer transition-transform transform hover:scale-110`}
                onClick={() => setIsOpen(prev => !prev)}>
            </i>
            {isOpen &&
                <ul className='absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg text-base text-left text-gray-900 '>
                    <li className='dropdownlist-item' onClick={() => handleClickOptions("profile")}> <i className="ph-duotone ph-user-circle-gear text-lg"></i> Profile</li>
                    <li className='dropdownlist-item' onClick={() => handleClickOptions("invite")}><i className="ph-duotone ph-user-plus text-lg"></i> Invite Friends</li>
                    <li className='dropdownlist-item flex items-center' onClick={handleLogout}>
                        <i className="ph-duotone ph-sign-out text-lg"></i>
                        {globalLoading === "logout" ?
                            <div className='sticky z-3 w-full h-full flex justify-center items-center'>
                                <Loader className='bg-transparent' />
                            </div>
                            :
                            <p>Logout</p>
                        }
                    </li>
                </ul>
            }
        </div>
    )
}

export default React.memo(OptionsDropdown);
