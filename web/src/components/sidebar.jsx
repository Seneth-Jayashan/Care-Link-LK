import React, { useState, useEffect } from "react";
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
  Building2,
  User,
  ChevronDown,
  Loader2,
} from "lucide-react";
import api from "../api/api";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // 1. Add state to store hospital status and loading state
  const [hasHospital, setHasHospital] = useState(null);
  const [isLoadingHospitalStatus, setIsLoadingHospitalStatus] = useState(true);

  const [openAdminHM, setOpenAdminHM] = React.useState(() =>
    [
      "/admin/add-hospital-manager",
      "/admin/edit-hospital-manager",
      "/admin/delete-hospital-manager",
    ].some((p) => location.pathname.startsWith(p))
  );

  // 2. Fetch data inside useEffect to run only when user changes
  useEffect(() => {
    // Only perform this check for the hospitaladmin role
    if (user?.role?.toLowerCase() !== "hospitaladmin" || !user?.id) {
      setIsLoadingHospitalStatus(false);
      return;
    }

    const checkHospitalStatus = async () => {
      setIsLoadingHospitalStatus(true);
      try {
        const res = await api.get(`/users/${user.id}`);
        // Set state to true if a hospital ID exists, otherwise false
        setHasHospital(!!res.data?.hospital?._id);
      } catch (error) {
        console.error("Failed to fetch hospital status for user:", error);
        setHasHospital(false); // Assume no hospital if there's an error
      } finally {
        setIsLoadingHospitalStatus(false);
      }
    };

    checkHospitalStatus();
  }, [user?.id, user?.role]); // Dependency array ensures this runs when user logs in

  // 3. Define roleMenus inside the component to access the `hasHospital` state
  const roleMenus = {
    patient: [
      { name: "Dashboard", to: "/patient", icon: LayoutDashboard },
      { name: "Manage Appointment", to: "/patient/doctors", icon: LayoutDashboard },
      { name: "My Appointments", to: "/patient/appointments", icon: HeartPulse },
      { name: "Profile", to: "/patient/profile", icon: User },
    ],
    doctor: [
      { name: "Dashboard", to: "/doctor", icon: LayoutDashboard },
      { name: "Patient", to: "/doctor/patient", icon: HeartPulse },
      { name: "Appointments", to: "/doctor/appointments", icon: Stethoscope },
     
    ],
    hospitaladmin: [
      { name: "Dashboard", to: hasHospital ? "/hospital" : "/hospital/details", icon: LayoutDashboard },
      { name: "Doctors", to: hasHospital ? "/hospital/doctors" : "/hospital/details", icon: Stethoscope },
      { name: "Patients", to: hasHospital ? "/hospital/patients" : "/hospital/details", icon: HeartPulse },
      { name: "Reports", to: hasHospital ? "/hospital/reports" : "/hospital/details", icon: LayoutDashboard },
      { name: "Hospital", to: "/hospital/details", icon: Building2 },
    ],
    admin: [
      { name: "System Dashboard", to: "/admin", icon: LayoutDashboard },
      {
        name: "Hospital Managers",
        icon: Building2,
        children: [
          { name: "View All", to: "/admin/hospital-managers" },
          { name: "Add", to: "/admin/add-hospital-manager" },
        ],
      },
      { name: "Users", to: "/admin/users", icon: Users },
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
        <Link to="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900">Care Link</span>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {isLoadingHospitalStatus && user?.role?.toLowerCase() === 'hospitaladmin' ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <Loader2 className="animate-spin mr-2" size={18}/>
            <span>Loading...</span>
          </div>
        ) : (
          menus.map((item, idx) => {
            const Icon = item.icon;
            if (item.children) {
              const anyChildActive = item.children.some((c) => location.pathname.startsWith(c.to));
              const open = anyChildActive || openAdminHM;
              return (
                <div key={`submenu-${idx}`}>
                  <div
                    onClick={() => setOpenAdminHM((v) => !v)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      open || anyChildActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      {Icon && <Icon size={18} className="mr-3" />}
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                  {open && (
                    <div className="mt-1 ml-6 border-l border-gray-200 pl-3">
                      {item.children.map((child) => {
                        const childActive = location.pathname.startsWith(child.to);
                        return (
                          <Link key={child.to} to={child.to}>
                            <div className={`px-3 py-2 rounded-md my-1 text-sm transition-colors ${
                                childActive
                                  ? "bg-blue-100 text-blue-700 font-semibold"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {child.name}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to || `${item.name}-${idx}`} to={item.to}>
                <div
                  className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {Icon && <Icon size={18} className="mr-3" />}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-gray-200 p-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg hover:bg-red-100 transition font-semibold"
        >
          <LogOut size={18} />
          Logout
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;