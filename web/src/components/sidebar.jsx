import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Stethoscope,
  HeartPulse,
  Users,
  Settings,
  LogOut,
  Home,
  Building2,
  User,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Role-based sidebar links
  const roleMenus = {
    patient: [
      { name: "Dashboard", to: "/patient", icon: LayoutDashboard },
      { name: "My Appointments", to: "/patient/appointments", icon: HeartPulse },
      { name: "Profile", to: "/patient/profile", icon: User },
    ],
    doctor: [
      { name: "Dashboard", to: "/doctor", icon: LayoutDashboard },
      { name: "Patient", to: "/doctor/patient", icon: HeartPulse },
      { name: "Appointments", to: "/doctor/appointments", icon: Stethoscope },
      { name: "Profile", to: "/doctor/profile", icon: User },
    ],
    hospitaladmin: [
      { name: "Dashboard", to: "/hospital", icon: LayoutDashboard },
      { name: "Doctors", to: "/hospital/doctors", icon: Stethoscope },
      { name: "Patients", to: "/hospital/patients", icon: HeartPulse },
      { name: "Hospital", to: "/hospital/details", icon: Building2 },
      { name: "Settings", to: "/hospital/settings", icon: Settings },
    ],
    admin: [
      { name: "System Dashboard", to: "/admin", icon: LayoutDashboard },
      { name: "Hospitals", to: "/admin/hospitals", icon: Building2 },
      { name: "Users", to: "/admin/users", icon: Users },
      { name: "System Settings", to: "/admin/settings", icon: Settings },
    ],
  };

  const menus = roleMenus[user?.role?.toLowerCase()] || [];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      exit={{ x: -250 }}
      className="h-screen w-64 bg-white shadow-lg border-r border-gray-200 fixed top-0 left-0 flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold text-gray-900">Care Link</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link key={item.to} to={item.to}>
              <motion.div
                whileHover={{ scale: 0.9 }}
                className={`flex items-center px-6 py-3 mb-1 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} className="mr-3" />
                <span>{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-gray-200 p-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <LogOut size={18} />
          Logout
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
