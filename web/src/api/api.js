import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Base Axios instance
const api = axios.create({
  baseURL: "http://localhost:3001/api/v1", // backend base URL
  withCredentials: true, // for cookies / JWT refresh if needed
});

// Optional: attach JWT token from AuthContext if needed
export const useApi = () => {
  const { user } = useAuth();

  api.interceptors.request.use(
    (config) => {
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return api;
};

export default api;
