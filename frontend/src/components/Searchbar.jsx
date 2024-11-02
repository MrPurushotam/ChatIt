/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { activeChatAtom } from "../states/atoms";
import OptionsDropdown from "./OptionsDropdown";
import initalizeApi from "../utils/Api";

const Searchbar = () => {
    const api =initalizeApi();
    const [searchUser, setSearchUser] = useState("");
    const [users, setUsers] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const setCurrentTextingUser = useSetRecoilState(activeChatAtom)
    const handleSearch = useCallback(async () => {
        if (!searchUser) {
            setUsers([]);
            return;
        }

        try {
            const resp = await api.get(`/user/search/${searchUser.trim() || " "}`);
            if (resp.data.success) {
                setUsers(resp.data.users);
            }
        } catch (error) {
            console.log("Error occurred:", error.message);
        }
    }, [searchUser]);

    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 300);

        setDebounceTimeout(timeoutId);

        return () => clearTimeout(timeoutId);
    }, [searchUser, handleSearch]);

    return (
        <div className="w-full"
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    setSearchUser("")
                    setUsers([])
                }
            }}
        >

            <form onSubmit={(e) => e.preventDefault()} className="relative w-full flex items-center">
                <div className="w-full">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        autoFocus={true}
                        className="w-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-2 sm:pr-4 text-sm sm:text-base text-gray-800 bg-white border-2 border-gray-300 placeholder:text-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                    />
                    <i className="ph-duotone ph-magnifying-glass text-gray-700 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-lg sm:text-xl"></i>
                </div>
                <div className="flex-shrink-0 ml-2">
                    <OptionsDropdown />
                </div>
            </form>

            {users.length > 0 && (
                <div className="absolute left-0 sm:left-2 right-0 sm:right-2 max-h-[60vh] sm:max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10" >
                    <ul className="divide-y divide-gray-100">
                        {users.map((user) => {
                            const date = new Date(user?.lastMessageAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            });
                            return (
                                <li key={user.otherUserId}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setCurrentTextingUser(user);
                                        setSearchUser("")
                                        setUsers([]);
                                    }}
                                >
                                    <div className="flex items-center px-2 sm:px-4 py-2 sm:py-3 gap-2">
                                        <div className='w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-transparent '>
                                            {
                                                user.otherUserProfile ?
                                                    (<img
                                                        src={user.otherUserProfile}
                                                        alt="Profile"
                                                        className='h-full w-full object-cover rounded-full'
                                                    />)
                                                    :
                                                    (<i className="ph-duotone ph-user text-2xl sm:text-3xl text-gray-600"></i>)
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-black text-sm sm:text-base">{user.otherUserName}</div>
                                            {user?.hasChat &&
                                                <div className="flex justify-between items-center w-full text-xs sm:text-sm">
                                                    <div className="text-gray-700 flex items-center overflow-hidden flex-1 mr-2">
                                                        <i className="ph-duotone ph-chat-text mr-1 hidden sm:inline"></i>
                                                        <span className="truncate">{user.lastMessage.substring(0, 30)}</span>
                                                    </div>
                                                    <div className="text-gray-500 text-xs whitespace-nowrap flex-shrink-0">{date}</div>
                                                </div>
                                            }

                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

        </div>
    );
};

export default Searchbar;
