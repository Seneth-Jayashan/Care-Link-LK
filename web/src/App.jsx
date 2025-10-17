import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Layouts
import MainLayout from "./components/layouts/MainLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Pages
import Home from "./pages/Home";
import About from "./pages/AboutUs";
import Login from "./pages/Login";

import PatientDashboard from "./pages/patient/Dashboard";
import PatientProfile from "./pages/patient/Profile.jsx";
import DisplayDoctors from "./pages/patient/DisplayDoctors.jsx";
import DoctorDetailPage from "./pages/patient/DoctorDetailPage.jsx";

import DoctorDashboard from "./pages/doctor/Dashboard";

import HospitalDashboard from "./pages/hospitaladmin/Dashboard";
import HospitalDoctors from "./pages/hospitaladmin/Doctors.jsx";
import HospitalPatients from "./pages/hospitaladmin/Patients.jsx";
import HospitalDetails from "./pages/hospitaladmin/HospitalDetails.jsx";

import AdminPanel from "./pages/admin/Dashboard";

// Private Route Wrapper
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      {/* 🏠 Public (MainLayout) Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/about"
        element={
          <MainLayout>
            <About />
          </MainLayout>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout>
            <Login />
          </MainLayout>
        }
      />

      {/* 🔐 Protected (DashboardLayout) Routes */}
      <Route
        path="/patient/*"
        element={
          <PrivateRoute roles={["patient"]}>
            <DashboardLayout>
              <PatientDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/patient/profile"
        element={
          <PrivateRoute roles={["patient"]}>
            <DashboardLayout>
              <PatientProfile />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/patient/doctors"
        element={
          <PrivateRoute roles={["patient"]}>
            <DashboardLayout>
              <DisplayDoctors/>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

       <Route
        path="/doctor/:id" 
        element={
          <PrivateRoute roles={["patient"]}>
            <DashboardLayout>
             <DoctorDetailPage/>
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/doctor/*"
        element={
          <PrivateRoute roles={["doctor"]}>
            <DashboardLayout>
              <DoctorDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/hospital/*"
        element={
          <PrivateRoute roles={["hospitaladmin"]}>
            <DashboardLayout>
              <HospitalDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/hospital/patients"
        element={
          <PrivateRoute roles={["hospitaladmin"]}>
            <DashboardLayout>
              <HospitalPatients />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/hospital/doctors"
        element={
          <PrivateRoute roles={["hospitaladmin"]}>
            <DashboardLayout>
              <HospitalDoctors/>
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/admin/*"
        element={
          <PrivateRoute roles={["admin"]}>
            <DashboardLayout>
              <AdminPanel />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/hospital/details"
        element={
          <PrivateRoute roles={["hospitaladmin"]}>
            <DashboardLayout>
              <HospitalDetails />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* 🚫 Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
