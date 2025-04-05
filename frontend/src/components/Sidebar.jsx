import Searchbar from "../components/Searchbar"
import IndividualUser from "../components/IndividualUser"
import SettingsInterface from "../components/SettingsInterface"
import { useRecoilState, useRecoilValue } from "recoil"
import { useMemo, useRef } from "react";
import { activeChatAtom, chatsAtom, globalLoadingAtom, isUserConnectedToInternetAtom, listChatsAtom, loggedUserAtom, selectedDropDownItemAtom } from "../states/atoms";
import Loader from "./Loader";
import InfiniteScroll from "react-infinite-scroller";

const Sidebar = ({ hasMoreChats, fetchChats }) => {
    const [listChats, setListChats] = useRecoilState(listChatsAtom);
    const selectedDropdownItem = useRecoilValue(selectedDropDownItemAtom);
    const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
    const [chats, setChats] = useRecoilState(chatsAtom);
    const loggedUser = useRecoilValue(loggedUserAtom);
    const isConnectedToInternet = useRecoilValue(isUserConnectedToInternetAtom);
    const globalLoading = useRecoilValue(globalLoadingAtom);

    // Infinite scroll variables
    const dropZoneRef = useRef(null);

    const addNewChatToSidebar = (data) => {
        const tempId = `temp-${Date.now()}`;
        const newChat = {
            ...data,
            id: tempId,
            lastMessage: "",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 0,
            isTemporary: true
        }
        setChats((chats) => ([newChat, ...chats]))
        return tempId;
    }

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
    // FIXME: Test the code if it works?
    return (
        <>
            <div className="h-full flex flex-col overflow-hidden">
                {selectedDropdownItem && <SettingsInterface />}
                {!selectedDropdownItem &&
                    <>
                        <nav className="sticky top-0 z-10"> {/* Increased z-index */}
                            <div className="bg-white px-2 py-3 border-b-2 border-gray-100">
                                <Searchbar createNewChat={addNewChatToSidebar} />
                            </div>

                            <div className="bg-white px-2 py-3 shadow-sm space-x-3 text-sm" id="user-list-type">
                                <span className={`px-2 py-1 border-2 w-fit rounded-full cursor-default select-none ${listChats === "all" && "bg-[#ee6143] text-white"} sm:px-3 sm:py-1 md:px-4 md:py-1 lg:px-3 lg:py-1`}
                                    onClick={() => setListChats("all")}>All</span>
                                <span className={`px-2 py-1 border-2 w-fit rounded-full cursor-default select-none ${listChats === "unread" && "bg-[#ee6143] text-white"} sm:px-3 sm:py-1 md:px-4 md:py-1 lg:px-3 lg:py-1`}
                                    onClick={() => setListChats("unread")}>Unread</span>
                            </div>
                        </nav>

                        <div className="h-full overflow-x-hidden overflow-y-auto z-0" id="sidebar" ref={dropZoneRef}>
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
                            <InfiniteScroll
                                pageStart={sortChatsInDesc.length}
                                loadMore={() => { fetchChats(sortChatsInDesc.length, sortChatsInDesc.length + 20) }}
                                hasMore={hasMoreChats}
                                loader={<Loader className=" flex justify-center overflow-hidden" />}
                                useWindow={false}
                                getScrollParent={() => dropZoneRef.current}
                                key={11131434254}
                            >

                                {sortChatsInDesc?.map((chat) => (
                                    <IndividualUser
                                        key={chat.id}
                                        chatDetail={chat}
                                        isActive={currentTextingUser?.id === chat.id}
                                        onClick={() => handleChatClick(chat.id)}
                                        loggedUser={loggedUser}
                                    />
                                ))}

                            </InfiniteScroll>
                        </div>
                    </>}

            </div>
        </>
    )
}

export default Sidebar


// <InfiniteScroll
//                         className="space-y-2"
//                         pageStart={messages.length}
//                         loadMore={fetchMessages}
//                         hasMore={hasMore}
//                         loader={<Loader className=" flex justify-center overflow-hidden" />}
//                         useWindow={false}
//                         isReverse={true}
//                         getScrollParent={() => dropZoneRef.current}
//                     >

//                         {
//                             messages?.map((msg) => {
//                                 return (
//                                     <div
//                                         key={msg.id}
//                                         className="message"
//                                         data-message-id={msg.id}
//                                         ref={el => {
//                                             if (el) {
//                                                 messageRefs.current[msg.id] = { ...msg, element: el };
//                                             }
//                                         }}
//                                     >
//                                         <SingleMessageUi
//                                             message={msg}
//                                             isUser={msg.senderId !== currentTextingUser.otherUserId}
//                                             messageSentBy={`${msg.senderId === currentTextingUser.otherUserId ? currentTextingUser.otherUserName : "You"}`}
//                                         />
//                                     </div>
//                                 )
//                             })
//                         }
//                     </InfiniteScroll>