import React, { createContext, useState, useContext } from "react";
import axios from "axios";

// Create AuthContext
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Axios instance
  const api = axios.create({
    baseURL: "http://localhost:3001/api/v1",
    withCredentials: true,
  });

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.user || res.data;
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    } finally {
      setUser(null);
      localStorage.removeItem("authUser");
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAuthenticated, api }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
