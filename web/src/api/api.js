import axios from "axios";

// Create base axios instance
const api = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  withCredentials: true, // for cookies / JWT if needed
});

// Attach token to all requests automatically
api.interceptors.request.use(
  (config) => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      config.headers.Authorization = `Bearer ${savedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
