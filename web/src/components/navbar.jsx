import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Stethoscope } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Default public links
  const navItems = [
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    { name: "Home", href: "#" },
    { name: "About Us", href: "/aboutus" },
    { name: "Contact Us", href: "#" }
=======
    { name: "Home", to: "/" },
    { name: "About Us", to: "/about" },
    { name: "Contact Us", to: "/contact" }
>>>>>>> Stashed changes
=======
    { name: "Home", to: "/" },
    { name: "About Us", to: "/about" },
    { name: "Contact Us", to: "/contact" }
>>>>>>> Stashed changes
  ];

  // Role-based links
  const roleLinks = {
    patient: [{ name: "Patient Dashboard", to: "/patient" }],
    doctor: [{ name: "Doctor Dashboard", to: "/doctor" }],
    hospitaladmin: [{ name: "Hospital Dashboard", to: "/hospital" }],
    admin: [{ name: "Admin Panel", to: "/admin" }]
  };

  const userLinks = user ? roleLinks[user.role] || [] : [];

  const allLinks = navItems.concat(userLinks);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="text-white" size={18} />
              </div>
              <span className="text-2xl font-bold text-gray-900">Care Link</span>
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {allLinks.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.to}
                  className="text-gray-700 hover:text-blue-600 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={16} />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <User size={16} /> Login
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="py-4 space-y-4">
                {allLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Auth */}
                <div className="pt-4 border-t border-gray-200">
                  {user ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Logout
                    </motion.button>
                  ) : (
                    <Link to="/login">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Login
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
