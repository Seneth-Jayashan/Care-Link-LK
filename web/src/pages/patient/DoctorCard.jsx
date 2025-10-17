import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, Building, Award } from "lucide-react"; // Added Award icon

const DoctorCard = ({ doctor, onView }) => {
  // Destructure for cleaner access and provide default empty objects
  const user = doctor.user || {};
  const hospital = doctor.hospital || {};

  // Improved image path handling with a clear fallback
  const profileImg = user.profileImage || doctor.profilePicture || "/default-avatar.png";
  
  // Construct a safe image URL. Using a .env variable for the API base URL is recommended.
  const API_BASE_URL = "http://localhost:3001"; 
  const imageUrl = `${API_BASE_URL}/${profileImg.replace(/\\/g, "/")}`;

  // Handle click on the entire card for better UX
  const handleCardClick = () => {
    onView(doctor);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center cursor-pointer overflow-hidden border border-gray-100 h-full"
      aria-label={`View profile for Dr. ${user.name || "Unknown"}`}
    >
      <div className="relative mb-4">
        <img
          src={imageUrl}
          alt={`Dr. ${user.name || "Unknown"}`}
          className="w-28 h-28 rounded-full object-cover border-4 border-blue-200"
        />
        {/* Optional: Online status indicator */}
        {doctor.isAvailable && (
          <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-green-500 border-2 border-white" title="Available now"></span>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900">
        Dr. {user.name || "Unknown"}
      </h2>
      
      {/* Optional: Display qualifications if available */}
      {doctor.qualifications && (
        <p className="text-sm text-gray-500 mt-1">{doctor.qualifications}</p> // e.g., "MBBS, MD"
      )}

      {/* Specialty Badge for better visual emphasis */}
      <div className="mt-3 bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 text-sm">
        <Stethoscope size={16} />
        <span>{doctor.specialty || "Not specified"}</span>
      </div>

      <div className="my-4 space-y-2 text-gray-600 w-full">
        {hospital.name && (
          <div className="flex items-center justify-center gap-2">
            <Building size={16} className="text-gray-400" />
            <span className="truncate">{hospital.name}</span>
          </div>
        )}
        
        {/* Optional: Display years of experience */}
        {doctor.experience > 0 && (
          <div className="flex items-center justify-center gap-2">
            <Award size={16} className="text-gray-400" />
            <span>{doctor.experience} years of experience</span>
          </div>
        )}
      </div>

      {/* This div now acts as a clear call-to-action, but the whole card is clickable */}
      <div className="mt-auto pt-4 w-full">
         <div className="w-full px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg group-hover:bg-blue-700 transition-colors duration-200">
             View Profile
         </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;