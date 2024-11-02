import Searchbar from "../components/Searchbar"
import IndividualUser from "../components/IndividualUser"
import SettingsInterface from "../components/SettingsInterface"
import { useRecoilState, useRecoilValue } from "recoil"
import { useMemo } from "react";
import { activeChatAtom, chatsAtom, globalLoadingAtom, isUserConnectedToInternetAtom, listChatsAtom, loggedUserAtom, selectedDropDownItemAtom } from "../states/atoms";
import Loader from "./Loader";

const Sidebar = () => {
    const [listChats, setListChats] = useRecoilState(listChatsAtom);
    const selectedDropdownItem = useRecoilValue(selectedDropDownItemAtom);
    const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
    const chats = useRecoilValue(chatsAtom);
    const loggedUser = useRecoilValue(loggedUserAtom);
    const isConnectedToInternet = useRecoilValue(isUserConnectedToInternetAtom);
    const globalLoading = useRecoilValue(globalLoadingAtom);

    const sortChatsInDesc = useMemo(() => {
        let filteredChats = [...chats];
        if (listChats === 'unread') {
            filteredChats = filteredChats.filter(chat =>
                chat.unreadCount > 0 && chat.lastMessageSenderId !== loggedUser?.id
            );
        }
        return filteredChats.sort((a, b) => {
            const dateA = new Date(a.lastMessageAt);
            const dateB = new Date(b.lastMessageAt);
            return dateB - dateA;
        })
    }, [chats, listChats])

    const handleChatClick = (id) => {
        const selectedChat = chats.find(chat => chat.id === id);
        setCurrentTextingUser(selectedChat);
    }

    return (
        <>
            <div className="h-full flex flex-col overflow-hidden">
                {selectedDropdownItem && <SettingsInterface />}
                {!selectedDropdownItem &&
                    <>
                        <nav className="sticky top-0">
                            <div className="bg-white px-2 py-3 border-b-2 border-gray-100">
                                <Searchbar />
                            </div>
                            {
                                <div className="bg-white px-2 py-3 shadow-sm space-x-3 text-sm">
                                    <span className={`px-2 py-1 border-2 w-fit rounded-full cursor-default select-none ${listChats === "all" && "bg-[#ee6143] text-white"} sm:px-3 sm:py-1 md:px-4 md:py-1 lg:px-3 lg:py-1`}
                                        onClick={() => setListChats("all")}>All</span>
                                    <span className={`px-2 py-1 border-2 w-fit rounded-full cursor-default select-none ${listChats === "unread" && "bg-[#ee6143] text-white"} sm:px-3 sm:py-1 md:px-4 md:py-1 lg:px-3 lg:py-1`}
                                        onClick={() => setListChats("unread")}>Unread</span>
                                </div>
                            }
                        </nav>

                        <div className="h-full overflow-x-hidden overflow-y-auto">
                            {/* list users here */}
                            {globalLoading === "fetching-chats" ?
                                <div className="sticky h-full w-full flex justify-center items-center">
                                    <Loader />
                                </div>
                                :
                                sortChatsInDesc.length < 1 ?
                                    <div className="text-xs md:text-sm font-semibold text-[#ee6143] flex items-center justify-center w-full my-4">
                                        {listChats === "unread" ? "You have no unread chats." : "Search for user and start chatting."}
                                    </div>
                                    : null
                            }

                            {!isConnectedToInternet &&
                                <div className="flex items-center gap-4 w-full px-1 py-3 bg-gray-300 rounded-sm shadow-sm">
                                    <div className="rounded-full p-1 border-2 border-black">
                                        <i className="ph-duotone ph-wifi-slash text-2xl"></i>
                                    </div>
                                    <p className="text-base font-semibold text-slate-800 break-words tracking-wider">
                                        Poor Connection. Please connect to internet.
                                    </p>
                                </div>
                            }
                            {sortChatsInDesc?.map((chat) => (
                                <IndividualUser
                                    key={chat.id}
                                    chatDetail={chat}
                                    isActive={currentTextingUser?.id === chat.id}
                                    onClick={() => handleChatClick(chat.id)}
                                    loggedUser={loggedUser}
                                />
                            ))}
                        </div>
                    </>}

            </div>
        </>
    )
}

export default Sidebar
