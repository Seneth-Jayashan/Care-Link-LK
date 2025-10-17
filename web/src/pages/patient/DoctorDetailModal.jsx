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
  MapPin
} from "lucide-react";

/**
 * Small star rating component with half-star support (same style as reference)
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

/**
 * Redesigned DoctorDetailModal that matches the DoctorCard theme provided.
 * - gradient header, centered avatar with glow
 * - rating, availability badge
 * - clearer schedule chips and sticky footer with CTA
 * - keeps original booking behavior (government-covered direct booking vs private flow)
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
  const consultationFeeLabel = isGovernmentHospital ? "Covered" : (doctor.consultationFee ? `LKR ${doctor.consultationFee.toLocaleString()}` : "N/A");

  // memoize formatted schedule so UI updates are cheap
  const schedule = useMemo(() => doctor.schedule || [], [doctor.schedule]);

  const handleDirectBook = async () => {
    if (!selectedSlot || !hospitalDetails || !authUser) return;
    setError("");
    setIsBooking(true);

    try {
      const appointmentDate = new Date(); // could be replaced with selected date logic
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

      // navigate to success page with the appointment
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Hero */}
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 flex gap-6 items-center">
          {/* Availability badge */}
          {doctor.isAvailable && (
            <div className="absolute right-6 top-6 z-20">
              <div className="relative">
                <div className="absolute -inset-1 bg-green-500 rounded-full blur opacity-30"></div>
                <span className="relative bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <Clock size={12} />
                  Available
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-5 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <img
                src={imageUrl}
                alt={`Dr. ${userDetails.name || "Unknown"}`}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Dr. {userDetails.name || "Unknown"}</h2>
                <div className="text-sm text-gray-600">{doctor.qualifications?.join(", ")}</div>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <Stethoscope size={16} />
                  <span>{doctor.specialty || "General Practitioner"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <StarRating rating={doctor.rating || 4.5} />
                  <span className="font-semibold text-gray-700">{doctor.rating || 4.5}</span>
                  <span className="text-xs text-gray-500">({doctor.reviewCount || 0})</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-gray-600">
                {hospitalDetails.name && (
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-gray-400" />
                    <span className="text-sm">{hospitalDetails.name}</span>
                  </div>
                )}

                {hospitalDetails.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm max-w-xs truncate">{hospitalDetails.location}</span>
                  </div>
                )}

                {doctor.yearsOfExperience > 0 && (
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-gray-400" />
                    <span className="text-sm">{doctor.yearsOfExperience} yrs</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute top-4 left-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {doctor.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
            </div>
          )}

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <Calendar size={18} />
              Select an Available Time
            </h3>

            {schedule.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {schedule.map((slot) => {
                  const isSelected = selectedSlot?._id === slot._id;
                  return (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`text-left p-3 rounded-lg border transition-all duration-150 flex flex-col gap-1 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 font-semibold shadow"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-700"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{slot.day}</div>
                        <div className="text-xs text-gray-200 bg-black/10 rounded-full px-2 py-0.5">{slot.type || ""}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock size={14} />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 bg-gray-50 p-4 rounded-lg">No schedule available for this doctor.</div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-white to-gray-50 border border-gray-100">
              <h4 className="text-sm text-gray-500">Consultation</h4>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="text-2xl font-bold text-gray-900">{consultationFeeLabel}</div>
                <div className="text-xs text-gray-500">({isGovernmentHospital ? 'Government covered' : 'Private hospital fee'})</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-white to-gray-50 border border-gray-100">
              <h4 className="text-sm text-gray-500">Languages</h4>
              <div className="mt-2 text-sm text-gray-700">
                {doctor.languages?.length ? doctor.languages.join(", ") : "English, Sinhala"}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
          )}
        </div>

        {/* Sticky Footer with CTA */}
        <div className="p-6 border-t sticky bottom-0 bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Selected Slot</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedSlot ? `${selectedSlot.day} • ${selectedSlot.startTime} - ${selectedSlot.endTime}` : "No slot selected"}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={isGovernmentHospital ? handleDirectBook : handleProceedToBooking}
                disabled={!selectedSlot || isBooking}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition shadow-lg w-full sm:w-auto justify-center
                  ${isGovernmentHospital ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                  ${(!selectedSlot || isBooking) ? "opacity-60 cursor-not-allowed" : ""}
                `}
                aria-disabled={!selectedSlot || isBooking}
                title={isGovernmentHospital ? "Book now (government covered)" : "Proceed to booking"}
              >
                {isBooking ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                <span>
                  {isBooking ? "Processing..." : (isGovernmentHospital ? "Book Now (Govt. Covered)" : "Proceed to Book")}
                </span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorDetailModal;