import React from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  // Redirect non-logged users to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="ml-64 flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
