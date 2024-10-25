import React from 'react';
import { useRecoilValue } from 'recoil';
import { selectedDropDownItemAtom } from "../states/atoms";
import ProfileSection from './ProfileSection';
import InviteUser from './InviteUser';

const SettingsInterface = () => {
    const selectedDropdownItem = useRecoilValue(selectedDropDownItemAtom);

    return (
        <div className='bg-gray-200 h-screen overflow-y-auto'>
            <div className='w-full max-w-md mx-auto sm:max-w-lg lg:max-w-xl xl:max-w-2xl px-4'>
                {selectedDropdownItem === "profile" && <ProfileSection />}
                {selectedDropdownItem === "invite" && <InviteUser />}
            </div>
        </div>
    );
};

export default SettingsInterface;
