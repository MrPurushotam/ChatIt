import axios from 'axios';
import { showToast } from '../components/toast';

let instance;

const initalizeApi = () => {
    if (!navigator.onLine) {
        throw new Error("Broswer not connectede to internet.");
    }
    if (!instance) {
        instance = axios.create({
            baseURL: `${import.meta.env.VITE_SERVER_URL}/api/v1/`,
        });
        instance.interceptors.request.use(
            (config) => {
                const token = window.localStorage.getItem("token");
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        )

        instance.interceptors.response.use(
            response => response,
            async (error) => {
                if (error.response && error.response.status === 401) {
                    console.log("Session expired. Logging out...");
                    showToast("Session expired. Logging out...", "error");
                    window.localStorage.removeItem("token");
                    window.location.href = "/signin";
                }
                return Promise.reject(error);
            }
        );
    }
    return instance;
}


export default initalizeApi;