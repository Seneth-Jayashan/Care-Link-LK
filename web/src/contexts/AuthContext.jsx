import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api";

// Create Auth Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("authUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // 🧩 Attach token to all API requests
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    });
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [user]);

  // 🔐 Login
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
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
      };
    } finally {
      setLoading(false);
    }
  };

  const loginQR = async (email, userId) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login/QR", { email,userId });
      const userData = res.data.user || res.data;
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
      };
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
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
    <AuthContext.Provider
      value={{ user, setUser, login, logout,loginQR, loading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => useContext(AuthContext);
