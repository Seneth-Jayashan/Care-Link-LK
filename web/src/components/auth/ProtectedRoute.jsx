import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Props:
 * - children: component(s) to render
 * - roles: array of allowed roles, e.g., ['admin', 'doctor']
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h2 className="text-red-600 text-xl font-semibold">
          You do not have access to this page
        </h2>
      </div>
    );
  }

  // User has access
  return children;
};

export default ProtectedRoute;
