import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.API_BASE_URL || "http://192.168.100.4/api",
    headers: {
        "Content-Type": "application/json",
    },
});
export default apiClient;
