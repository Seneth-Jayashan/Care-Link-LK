import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, Building, Award, Star, Clock } from "lucide-react";

// NEW: A reusable component for displaying star ratings
const StarRating = ({ rating = 0 }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const emptyStars = totalStars - fullStars;

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={16} className="text-yellow-400 fill-current" />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={16} className="text-gray-300" />
      ))}
    </div>
  );
};

const DoctorCard = ({ doctor, onView }) => {
  // Destructure for cleaner access and provide default empty objects
  const user = doctor.user || {};
  const hospital = doctor.hospital || {};

  // Construct a safe image URL.
  const API_BASE_URL = "http://localhost:3001";
  const profileImg = user.profileImage || "/default-avatar.png";
  const imageUrl = `${API_BASE_URL}/${profileImg.replace(/\\/g, "/")}`;

  const handleCardClick = () => {
    onView(doctor);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, boxShadow: "0px 15px 25px rgba(0, 77, 153, 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg p-6 flex flex-col text-center cursor-pointer overflow-hidden border border-gray-100 h-full group"
      aria-label={`View profile for Dr. ${user.name || "Unknown"}`}
    >
      <div className="relative mb-4">
        <img
          src={imageUrl}
          alt={`Dr. ${user.name || "Unknown"}`}
          className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300"
        />
        {/* MODIFIED: More descriptive availability badge */}
        {doctor.isAvailable && (
          <span className="absolute bottom-1 right-0 text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 border-2 border-white">
            <Clock size={12} />
            Available Today
          </span>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 truncate w-full">
        Dr. {user.name || "Unknown"}
      </h2>
      
      {/* MODIFIED: Safer rendering for qualifications array */}
      {doctor.qualifications?.length > 0 && (
        <p className="text-sm text-gray-500 mt-1 truncate w-full">{doctor.qualifications.join(', ')}</p>
      )}

      {/* NEW: Star Rating Display */}
      <div className="flex items-center gap-2 my-3">
        <StarRating rating={doctor.rating || 4} />
        <span className="text-sm text-gray-500">({doctor.reviewCount || 0} reviews)</span>
      </div>

      {/* Specialty Badge remains visually effective */}
      <div className="bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 text-sm">
        <Stethoscope size={16} />
        <span>{doctor.specialty || "Not specified"}</span>
      </div>

      <div className="my-4 space-y-2 text-gray-600 w-full flex-grow">
        {hospital.name && (
          <div className="flex items-center justify-center gap-2">
            <Building size={16} className="text-gray-400" />
            <span className="truncate">{hospital.name}</span>
          </div>
        )}
        
        {doctor.yearsOfExperience > 0 && (
          <div className="flex items-center justify-center gap-2">
            <Award size={16} className="text-gray-400" />
            <span>{doctor.yearsOfExperience} years experience</span>
          </div>
        )}
      </div>

      {/* MODIFIED: Added clear fee display */}
      <div className="w-full mt-auto pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">Consultation Fee</p>
        <p className="text-xl font-bold text-blue-600">
          LKR {doctor.consultationFee?.toLocaleString() || 'N/A'}
        </p>
        <div className="mt-3 w-full px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg group-hover:bg-blue-700 transition-colors duration-200">
          Book Appointment
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;