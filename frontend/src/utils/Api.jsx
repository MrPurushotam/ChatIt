import axios from 'axios';

let instance ;

const initalizeApi=()=>{
    if(!navigator.onLine){
        throw new Error("Broswer not connectede to internet.");
    }
    if(!instance){
        instance = axios.create({
            baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1/`,
        });
        instance.interceptors.request.use(
            config=>{
                const token = window.localStorage.getItem("token");
                if(token){
                    config.headers['Authorization']=`Bearer ${token}`;
                }
                return config;
            },
            (error)=>{
                return Promise.reject(error);
            }
        )
    }
    return instance;
}


export default initalizeApi;