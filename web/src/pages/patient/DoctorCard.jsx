import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, Building, Award, Star, Clock, MapPin } from "lucide-react";

// ⭐ Enhanced star rating component with half-star support
const StarRating = ({ rating = 0 }) => {
  const total = 5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(total)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.floor(rating);
        const isHalf = !isFilled && starValue - 0.5 <= rating;
        
        return (
          <div key={i} className="relative">
            <Star 
              size={16} 
              className={`${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
            />
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star size={16} className="text-yellow-400 fill-current" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const DoctorCard = ({ doctor, onView }) => {
  const user = doctor.user || {};
  const hospital = doctor.hospital || {};
  const API_BASE_URL = "http://localhost:3001";
  const profileImg = user.profileImage || "/default-avatar.png";
  const imageUrl = `${API_BASE_URL}/${profileImg.replace(/\\/g, "/")}`;

  return (
    <motion.div
      layout
      onClick={() => onView(doctor)}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Availability Badge */}
      {doctor.isAvailable && (
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <div className="absolute -inset-1 bg-green-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <span className="relative bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Clock size={12} />
              Available
            </span>
          </div>
        </div>
      )}

      {/* Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-8 pb-6 flex flex-col items-center">
        {/* Profile Image with Glow Effect */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
          <img
            src={imageUrl}
            alt={`Dr. ${user.name || "Unknown"}`}
            className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-blue-100 transition-all duration-300 z-10"
          />
        </div>

        {/* Doctor Name & Qualifications */}
        <div className="text-center px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            Dr. {user.name || "Unknown"}
          </h2>
          {doctor.qualifications?.length > 0 && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {doctor.qualifications.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-5 space-y-4">
        {/* Specialty Badge */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-sm">
            <Stethoscope size={16} />
            <span>{doctor.specialty || "General Practitioner"}</span>
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <StarRating rating={doctor.rating || 4.5} />
            <span className="text-sm font-semibold text-gray-700">
              {doctor.rating || 4.5}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            ({doctor.reviewCount || 0} reviews)
          </span>
        </div>

        {/* Hospital & Experience */}
        <div className="space-y-3">
          {hospital.name && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex-shrink-0 w-5">
                <Building size={15} className="text-gray-400" />
              </div>
              <span className="text-sm leading-relaxed">{hospital.name}</span>
            </div>
          )}
          
          {doctor.yearsOfExperience > 0 && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex-shrink-0 w-5">
                <Award size={15} className="text-gray-400" />
              </div>
              <span className="text-sm">
                {doctor.yearsOfExperience} years experience
              </span>
            </div>
          )}
          
          {hospital.location && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex-shrink-0 w-5">
                <MapPin size={15} className="text-gray-400" />
              </div>
              <span className="text-sm truncate">{hospital.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with CTA */}
      <div className="px-6 py-5 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 font-medium">Consultation Fee</p>
            <p className="text-xl font-bold text-gray-900">
              LKR {doctor.consultationFee?.toLocaleString() || "N/A"}
            </p>
          </div>
          {doctor.isAvailable && (
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Wait Time</p>
              <p className="text-sm font-semibold text-green-600">
                {doctor.waitTime || "< 15 min"}
              </p>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View Profile
        </motion.button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
};

export default DoctorCard;