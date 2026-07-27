import axios  from 'axios'

const axiosInstance=axios.create({
    baseURL : "https://shelfmate.kindpond-d4d80e1b.centralindia.azurecontainerapps.io/shelfmate/api"
})

axiosInstance.interceptors.request.use((config)=>{
    const token =localStorage.getItem("token")
    if (token) config.headers["x-access-token"]=token;
    return config;
})


export default axiosInstance;
