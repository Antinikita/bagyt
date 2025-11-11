import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // или ngrok URL
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest", // 💡 важно для Laravel
  },
});
export const getCsrfCookie = () => api.get("/sanctum/csrf-cookie");
export default api;
