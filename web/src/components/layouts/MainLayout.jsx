import React from "react";
import Navbar from "../Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar at the top */}
      <Navbar />
      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-4 text-gray-600">
        © {new Date().getFullYear()} CareLink. All Rights Reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
