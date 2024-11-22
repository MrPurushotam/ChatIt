import { atom, selector } from "recoil";
import initalizeApi from "../utils/Api";

export const socketAtom = atom({
    key: "socket",
    default: {socket:null}
})

export const disconnectSocketAtom=atom({
    key:"disconnectSocket",
    default:false
})

export const activeChatAtom = atom({
    key: "activeChat",
    default: null
})

export const chatsAtom = atom({
    key: "chats",
    default: []
})

export const listChatsAtom = atom({
    key: "listChats",
    default: "all"
})

export const messagesAtom = atom({
    key: "messages",
    default: []
})

export const authenticatedAtom = atom({
    key: "authenticated",
    default: false
})

export const loggedUserAtom = atom({
    key: "LoggedUser",
    default: null
})

export const fetchUserDetailSelector= selector({
    key:"FetchUserDetail",
    get:async({get})=>{
        const isAuthenticated= get(authenticatedAtom);
        const api =initalizeApi();
        if(!isAuthenticated) return null;
        try {
            const resp = await api.get("/user/");
            if(resp.data.success){
                return resp.data.user;
            }
        } catch (error) {
            if(error.response.data.jwtExpired || error.response.data.error==="Jwt Expired"||(error.response.status===400 && error.response.data.error==="Jwt Expired")){
                return "Jwt Expired";
            }
            console.error("Some error occured while fetching user details ",error.message);
            return null;
        }
    },
})

export const selectedDropDownItemAtom = atom({
    key: "selectedDropDown",
    default: null
})

export const viewImageAtom = atom({
    key: "viewImage",
    default: null
})

export const attachmentAtom= atom({
    key:"attachment",
    default:[]
})

export const globalLoadingAtom=atom({
    key:"GlobalLoadingTracker",
    default:"user"
})

export const isUserConnectedToInternetAtom=atom({
    key:"isUserConnectedToInternet",
    default:true
})

export const isConnectedAtom =atom({
    key:"isConnectedToBackend",
    default:"inital-connect"
})