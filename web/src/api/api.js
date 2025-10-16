// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api/v1", // ✅ Your backend base URL
  withCredentials: true, // ✅ Allows JWT cookies / refresh
});

// Optional: request/response logging for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
