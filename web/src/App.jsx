import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";

// Role-based pages
import PatientDashboard from "./pages/patient/Dashboard";
import DoctorDashboard from "./pages/doctor/Dashboard";
import HospitalDashboard from "./pages/hospitaladmin/Dashboard";
import AdminPanel from "./pages/admin/Dashboard";

import { useAuth } from "./contexts/AuthContext";

// PrivateRoute Component
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};


import AdminDashboard from './routes/Admindashboardrouttes';


function App() {
  const AdminRoute = ({ children }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (!token || role !== 'admin') {
      return <Navigate to="/login" replace />
    }
    return children;
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/patient"
            element={
              <PrivateRoute roles={["patient"]}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <PrivateRoute roles={["doctor"]}>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/hospital"
            element={
              <PrivateRoute roles={["hospitaladmin"]}>
                <HospitalDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
