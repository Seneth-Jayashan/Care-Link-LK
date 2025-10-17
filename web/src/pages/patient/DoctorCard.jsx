import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, Building } from "lucide-react";

const DoctorCard = ({ doctor, onView }) => {
  // doctor.user is populated
  const user = doctor.user || {};
  const profileImg =
    user.profileImage ||
    doctor.profilePicture || // fallback if stored in doctorDetails
    "/default-avatar.png";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4 hover:shadow-xl transition cursor-pointer"
    >
      <img
        src={`http://localhost:3001/${profileImg.replace(/\\/g, "/")}`}
        alt={user.name || "Doctor"}
        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
      />

      <h2 className="text-lg font-bold text-gray-800">{user.name || "Unknown"}</h2>

      <p className="text-gray-600 flex items-center gap-2">
        <Stethoscope size={16} /> {doctor.specialty || doctor.specialty || "Not specified"}
      </p>

      {doctor.hospital?.name && (
        <p className="text-gray-500 flex items-center gap-2">
          <Building size={16} /> {doctor.hospital.name}
        </p>
      )}

      <button
        onClick={() => onView(doctor)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
      >
        View
      </button>
    </motion.div>
  );
};

export default DoctorCard;
