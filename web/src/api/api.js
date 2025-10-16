import axios from "axios";

// Create base axios instance
const api = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  withCredentials: true, // for cookies / JWT if needed
});

// Attach token to all requests automatically
api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
