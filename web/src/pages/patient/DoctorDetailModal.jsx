import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Stethoscope,
  Building,
  Award,
  Languages,
  Calendar,
  Clock,
  ShieldCheck,
  Loader2,
  Star,
  MapPin,
  User,
  DollarSign
} from "lucide-react";

/**
 * Small star rating component with half-star support
 */
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
              className={`${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
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

/**
 * Redesigned DoctorDetailModal matching the blue gradient theme
 */
const DoctorDetailModal = ({ doctor = {}, onClose = () => {} }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const userDetails = doctor.user || {};
  const hospitalDetails = doctor.hospital || {};
  const API_BASE_URL = "http://localhost:3001";
  const profileImg = userDetails.profileImage || "/default-avatar.png";
  const imageUrl = `${API_BASE_URL}/${profileImg.replace(/\\/g, "/")}`;

  const isGovernmentHospital = hospitalDetails?.type === "government";
  const consultationFeeLabel = isGovernmentHospital ? "Government Covered" : (doctor.consultationFee ? `LKR ${doctor.consultationFee.toLocaleString()}` : "N/A");

  // memoize formatted schedule so UI updates are cheap
  const schedule = useMemo(() => doctor.schedule || [], [doctor.schedule]);

  const handleDirectBook = async () => {
    if (!selectedSlot || !hospitalDetails || !authUser) return;
    setError("");
    setIsBooking(true);

    try {
      const appointmentDate = new Date();
      const appointmentData = {
        patient: authUser._id,
        doctor: userDetails._id,
        hospital: hospitalDetails._id,
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: selectedSlot.startTime,
        reason: "Government Hospital Booking",
        status: "confirmed",
        paymentStatus: "paid"
      };

      const appointmentRes = await api.post("/appointments", appointmentData);
      const newAppointment = appointmentRes.data;

      const paymentData = {
        patient: authUser._id,
        appointment: newAppointment._id,
        hospital: hospitalDetails._id,
        amount: 0,
        paymentType: "coverage",
        status: "paid",
        provider: "Government Coverage"
      };

      await api.post("/payments", paymentData);

      navigate("/patient/booking-success", {
        state: { confirmedAppointment: newAppointment },
        replace: true
      });
    } catch (err) {
      console.error("Direct booking failed:", err);
      setError("Failed to complete booking. Please try again.");
      setIsBooking(false);
    }
  };

  const handleProceedToBooking = () => {
    if (!selectedSlot || !authUser) {
      setError("Please select a time slot before proceeding.");
      return;
    }

    navigate("/patient/booking-summary", {
      state: {
        doctorId: userDetails._id,
        doctorName: userDetails.name,
        specialty: doctor.specialty,
        consultationFee: doctor.consultationFee,
        hospitalId: hospitalDetails._id,
        selectedSlot
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-blue-950/30 flex justify-center items-end md:items-center z-50 transition-opacity duration-300 backdrop-blur-sm p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden relative animate-[slideUp_0.4s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        style={{
          animationName: "slideUp",
          animationDuration: "0.4s",
          animationTimingFunction: "ease-out",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200"
          aria-label="Close details"
        >
          <X size={24} />
        </button>

        {/* Header with Gradient Background */}
        <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            {/* Doctor Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-300 rounded-full blur-md opacity-60"></div>
                <img
                  src={imageUrl}
                  alt={`Dr. ${userDetails.name || "Unknown"}`}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg relative z-10"
                />
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
                  Dr. {userDetails.name || "Unknown"}
                </h2>
                
                {/* Availability Badge */}
                {doctor.isAvailable && (
                  <div className="inline-flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    <Clock size={14} />
                    Available
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-blue-700 font-semibold shadow-sm">
                  <Stethoscope size={18} />
                  <span>{doctor.specialty || "General Practitioner"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <StarRating rating={doctor.rating || 4.5} />
                  <span className="font-semibold text-blue-900">{doctor.rating || 4.5}</span>
                  <span className="text-sm text-blue-600">({doctor.reviewCount || 0})</span>
                </div>
              </div>

              {/* Additional Info Row */}
              <div className="flex flex-wrap items-center gap-4 text-blue-800">
                {hospitalDetails.name && (
                  <div className="flex items-center gap-2">
                    <Building size={16} />
                    <span className="text-sm font-medium">{hospitalDetails.name}</span>
                  </div>
                )}

                {doctor.yearsOfExperience > 0 && (
                  <div className="flex items-center gap-2">
                    <Award size={16} />
                    <span className="text-sm font-medium">{doctor.yearsOfExperience} years experience</span>
                  </div>
                )}

                {hospitalDetails.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="text-sm font-medium max-w-xs truncate">{hospitalDetails.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-8 space-y-8 max-h-[50vh] overflow-y-auto">
          {/* About Section */}
          {doctor.bio && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <User size={20} />
                About Doctor
              </h3>
              <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                {doctor.bio}
              </p>
            </div>
          )}

          {/* Schedule Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Calendar size={20} />
              Available Schedule
            </h3>

            {schedule.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedule.map((slot) => {
                  const isSelected = selectedSlot?._id === slot._id;
                  return (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white text-blue-900 border-blue-200 hover:border-blue-400 hover:shadow-md hover:scale-105"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-bold ${isSelected ? "text-white" : "text-blue-700"}`}>
                          {slot.day}
                        </div>
                        {slot.type && (
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            isSelected ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                          }`}>
                            {slot.type}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className={isSelected ? "text-white" : "text-blue-500"} />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                No schedule available for this doctor.
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Consultation Fee</p>
                  <p className="text-lg font-bold text-blue-900">{consultationFeeLabel}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {isGovernmentHospital ? 'Government covered' : 'Private hospital fee'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Languages size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Languages</p>
                  <p className="text-lg font-bold text-blue-900">
                    {doctor.languages?.length ? doctor.languages.join(", ") : "English, Sinhala"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 border-t border-blue-200 bg-white/95 backdrop-blur-sm sticky bottom-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-blue-600 font-semibold">Selected Time Slot</p>
              <p className="text-lg font-bold text-blue-900">
                {selectedSlot 
                  ? `${selectedSlot.day} • ${selectedSlot.startTime} - ${selectedSlot.endTime}`
                  : "Please select a time slot"
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={isGovernmentHospital ? handleDirectBook : handleProceedToBooking}
                disabled={!selectedSlot || isBooking}
                className={`flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 ${
                  isGovernmentHospital 
                    ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600" 
                    : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
                } ${(!selectedSlot || isBooking) ? "opacity-60 cursor-not-allowed" : "hover:shadow-xl hover:scale-105"}`}
              >
                {isBooking ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
                <span>
                  {isBooking 
                    ? "Processing..." 
                    : (isGovernmentHospital ? "Book Now (Govt. Covered)" : "Proceed to Book")
                  }
                </span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:scale-105 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Animation */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </motion.div>
  );
};

export default DoctorDetailModal;