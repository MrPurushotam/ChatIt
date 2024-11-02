import axios from 'axios';

let instance ;

const initalizeApi=()=>{
    if(!navigator.onLine){
        throw new Error("Broswer not connectede to internet.");
    }
    if(!instance){
        instance = axios.create({
            baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1/`,
            withCredentials: true,
        });
    }
    return instance
}


export default initalizeApi;