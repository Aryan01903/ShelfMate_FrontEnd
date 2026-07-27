import axios  from 'axios'
import { config } from './constant';

const axiosInstance=axios.create({
    baseURL : config.apiUrl
})

axiosInstance.interceptors.request.use((config)=>{
    const token =localStorage.getItem("token")
    if (token) config.headers["x-access-token"]=token;
    return config;
})


export default axiosInstance;
