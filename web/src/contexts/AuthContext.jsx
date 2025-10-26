import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api"; // Your configured axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- STATE ---
  // Initialize state DIRECTLY from localStorage.
  // Use null as default if nothing is found or parsing fails.
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("authUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("authUser"); // Clear invalid data
      localStorage.removeItem("authToken");
      return null;
    }
  });
  const [token, setToken] = useState(() => {
      const savedToken = localStorage.getItem("authToken");
      // Basic check if it looks like a JWT, could be more robust
      if (savedToken && savedToken.split('.').length === 3) {
          return savedToken;
      }
      localStorage.removeItem("authUser"); // Clear user if token is invalid/missing
      localStorage.removeItem("authToken");
      return null;
  });

  const [loadingAuth, setLoadingAuth] = useState(false); // Only used for login/logout actions now

  // --- AXIOS INTERCEPTOR EFFECT ---
  // This effect now runs whenever 'token' changes, setting or removing the header.
  useEffect(() => {
    console.log("AuthContext: Interceptor Effect Running. Token:", token);

    // Create the interceptor
    const interceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          console.log("AuthContext Interceptor: Attaching token.");
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log("AuthContext Interceptor: No token, removing header if present.");
          // Ensure header is removed if token becomes null (logout)
          delete config.headers.Authorization; 
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup function: Eject the interceptor when the component unmounts
    // or when the token changes (before the new one is added)
    return () => {
      console.log("AuthContext: Ejecting interceptor.");
      api.interceptors.request.eject(interceptor);
    };
  }, [token]); // Dependency: Run only when token state changes.

  // --- HELPER & AUTH FUNCTIONS ---

  // Helper function for login success
  const handleLoginSuccess = (data) => {
    const { user, token } = data;
    // Persist to local storage FIRST
    localStorage.setItem("authUser", JSON.stringify(user));
    localStorage.setItem("authToken", token);
    // THEN update state, which triggers the interceptor effect
    setUser(user);
    setToken(token);
    return user;
  };

  // Login function
  const login = async (email, password) => {
    setLoadingAuth(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const loggedInUser = handleLoginSuccess(res.data);
      return { success: true, user: loggedInUser };
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      // Clear any potentially partial auth state on login failure
      setUser(null);
      setToken(null);
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
      };
    } finally {
      setLoadingAuth(false);
    }
  };

  // Login with QR function
  const loginQR = async (email, userId) => {
    setLoadingAuth(true);
    try {
      const res = await api.post("/auth/login/QR", { email, userId });
      const loggedInUser = handleLoginSuccess(res.data);
      return { success: true, user: loggedInUser };
    } catch (err) {
       console.error("Login error:", err.response?.data || err.message);
       setUser(null);
       setToken(null);
       localStorage.removeItem("authUser");
       localStorage.removeItem("authToken");
       return {
         success: false,
         message: err.response?.data?.message || "Invalid credentials",
       };
    } finally {
      setLoadingAuth(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoadingAuth(true);
    // Clear state and storage FIRST
    setUser(null);
    setToken(null); // This triggers interceptor effect to remove header
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    try {
      // Attempt to invalidate token on backend, ignore errors
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API call error (ignored):", err.response?.data || err.message);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Check if user is authenticated (Simpler check now)
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      // Keep loadingAuth for UI feedback during login/logout actions
      value={{ user, setUser, token, login, logout, loginQR, loadingAuth, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);