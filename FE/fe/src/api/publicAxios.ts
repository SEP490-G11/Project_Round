import axios from "axios";

const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
   withCredentials: true,
});

export default publicAxios;
