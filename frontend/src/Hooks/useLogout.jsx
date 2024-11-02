import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResetRecoilState , useRecoilRefresher_UNSTABLE, useRecoilValue} from 'recoil';
import {
    socketAtom,
    activeChatAtom,
    chatsAtom,
    listChatsAtom,
    messagesAtom,
    authenticatedAtom,
    loggedUserAtom,
    selectedDropDownItemAtom,
    viewImageAtom,
    fetchUserDetailSelector,
} from '../states/atoms';
import initalizeApi from '../utils/Api';

export const useLogout = () => {
    const api =initalizeApi();
    const navigate = useNavigate();
    const resetSocket = useResetRecoilState(socketAtom);
    const resetActiveChat = useResetRecoilState(activeChatAtom);
    const resetChats = useResetRecoilState(chatsAtom);
    const resetMessages = useResetRecoilState(messagesAtom);
    const resetListChats = useResetRecoilState(listChatsAtom);
    const resetAuthenticated = useResetRecoilState(authenticatedAtom);
    const resetLoggedUser = useResetRecoilState(loggedUserAtom);
    const resetSelectedDropdownItem = useResetRecoilState(selectedDropDownItemAtom);
    const resetViewImage = useResetRecoilState(viewImageAtom);
    const resetFetchUserDetailsSelector= useRecoilRefresher_UNSTABLE(fetchUserDetailSelector);

    const logout = useCallback(async () => {
        try {
            const response = await api.get("/user/logout");
            if (response.data.success ) {
                resetSocket();
                resetActiveChat();
                resetChats();
                resetMessages();
                resetListChats();
                resetAuthenticated();
                resetSelectedDropdownItem();
                resetViewImage();
                resetLoggedUser();
                resetFetchUserDetailsSelector();
                navigate("/signin");
                console.log("Logged out successfully");
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.log("Some error occurred while logging out. ", error.message);
        }
    }, [resetSocket, resetActiveChat, resetChats, resetMessages, resetListChats, resetAuthenticated, resetSelectedDropdownItem, resetViewImage, resetLoggedUser, navigate]);

    return logout;
};