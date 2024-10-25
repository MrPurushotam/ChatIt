import { atom, selector } from "recoil";
import api from "../utils/Api";

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
        if(!isAuthenticated) return null;
        try {
            const resp = await api.get("/user/");
            if(resp.data.success){
                return resp.data.user;
            }else if (resp.status===401 && resp.data.message==="Jwt Expired"){
                console.log("Write a logic to reset staes and logout")
                return "Jwt Expired";
            }
        } catch (error) {
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