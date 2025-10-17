import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Loader2,
  Wallet,
  CreditCard,
  Shield,
  MapPin,
  Star
} from "lucide-react";

/**
 * Returns the next date for a given weekday name (e.g., "Monday")
 */
const getNextDayOfWeek = (dayName) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetDayIndex = days.indexOf(dayName);
  const today = new Date();
  const currentDayIndex = today.getDay();
  let daysToAdd = targetDayIndex - currentDayIndex;
  if (daysToAdd <= 0) daysToAdd += 7;
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + daysToAdd);
  return nextDate;
};

const formatDate = (date) =>
  date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingDetails, setBookingDetails] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!location.state?.doctorId) {
      navigate("/patient/doctors");
    } else {
      setBookingDetails(location.state);
    }
  }, [location, navigate]);

  const appointmentDate = useMemo(() => {
    if (!bookingDetails) return null;
    return getNextDayOfWeek(bookingDetails.selectedSlot.day);
  }, [bookingDetails]);

  const consultationFeeLabel = bookingDetails
    ? (bookingDetails.consultationFee ? `LKR ${bookingDetails.consultationFee.toLocaleString()}` : "N/A")
    : "";

  const validateForm = () => {
    const newErrors = {};
    if (!reasonForVisit.trim()) newErrors.reason = "Please provide a reason for your visit.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = async () => {
    if (!validateForm()) return;
    if (!bookingDetails || !user) return;

    setIsLoading(true);
    setErrors({});

    try {
      const appointmentData = {
        patient: user._id, // consistent with other components
        doctor: bookingDetails.doctorId,
        hospital: bookingDetails.hospitalId,
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: bookingDetails.selectedSlot.startTime,
        reason: reasonForVisit,
        status: "pending",
        paymentStatus: "unpaid",
      };

      const appointmentRes = await api.post("/appointments", appointmentData);
      const newAppointment = appointmentRes.data;

      if (paymentMethod === "card") {
        navigate(`/patient/payment/${newAppointment._id}`, {
          state: { appointment: newAppointment, bookingDetails },
          replace: true,
        });
      } else {
        navigate(`/patient/insurance-verification/${newAppointment._id}`, {
          state: { appointment: newAppointment, bookingDetails },
          replace: true,
        });
      }
    } catch (err) {
      console.error("Failed to create pending appointment:", err);
      setErrors({
        api: err?.response?.data?.message || "Could not initiate booking. Please try again.",
      });
      setIsLoading(false);
    }
  };

  if (!bookingDetails) return null;

  const doctor = bookingDetails.doctorName || "";
  const hospitalName = bookingDetails.hospitalName || bookingDetails.hospitalId || "";
  const slot = bookingDetails.selectedSlot || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-6 top-6 p-2 rounded-full bg-white/60 hover:bg-white text-gray-600 shadow-sm"
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md border-4 border-white">
              <User size={34} className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Confirm booking</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400" />
                  <span className="font-semibold">{bookingDetails.rating ?? 4.5}</span>
                  <span className="text-gray-500">({bookingDetails.reviewCount ?? 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{hospitalName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="p-6 space-y-6">
          {/* Summary Card */}
          <div className="border border-gray-100 rounded-lg p-4 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm text-gray-500">Doctor</h3>
                <p className="text-lg font-semibold text-gray-900">{doctor}</p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <div>
                      <div className="font-medium">{formatDate(appointmentDate)}</div>
                      <div className="text-xs text-gray-500">Approx date</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <div>
                      <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
                      <div className="text-xs text-gray-500">{slot.day}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <div>
                      <div className="font-medium truncate">{hospitalName}</div>
                      <div className="text-xs text-gray-500">Location</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-36 flex-shrink-0 text-right">
                <div className="text-sm text-gray-500">Fee</div>
                <div className="text-2xl font-bold text-gray-900">{consultationFeeLabel}</div>
                <div className="text-xs text-gray-500 mt-2">Payment at booking</div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Select Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setPaymentMethod("card")}
                onKeyDown={(e) => e.key === "Enter" && setPaymentMethod("card")}
                className={`p-4 rounded-lg border transition cursor-pointer flex items-start gap-4 ${paymentMethod === "card" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 bg-white"}`}
                aria-pressed={paymentMethod === "card"}
              >
                <div className="p-2 rounded-md bg-white border border-gray-100">
                  <CreditCard size={20} className={`${paymentMethod === "card" ? "text-blue-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-800">Pay by Card</div>
                    {paymentMethod === "card" && <div className="text-xs text-blue-700 font-semibold">Selected</div>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Secure online payment with card or saved methods.</div>
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setPaymentMethod("insurance")}
                onKeyDown={(e) => e.key === "Enter" && setPaymentMethod("insurance")}
                className={`p-4 rounded-lg border transition cursor-pointer flex items-start gap-4 ${paymentMethod === "insurance" ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 bg-white"}`}
                aria-pressed={paymentMethod === "insurance"}
              >
                <div className="p-2 rounded-md bg-white border border-gray-100">
                  <Shield size={20} className={`${paymentMethod === "insurance" ? "text-blue-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-800">Use Insurance</div>
                    {paymentMethod === "insurance" && <div className="text-xs text-blue-700 font-semibold">Selected</div>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Verify policy coverage and co-pay if any.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label htmlFor="reason" className="block text-lg font-semibold text-gray-800 mb-2">
              Reason for Visit <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                id="reason"
                type="text"
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="e.g., Annual check-up, fever, follow-up..."
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${errors.reason ? "border-red-500" : "border-gray-300"}`}
              />
            </div>
            {errors.reason && <p className="mt-2 text-sm text-red-600">{errors.reason}</p>}
            {errors.api && <p className="mt-2 text-sm text-red-600">{errors.api}</p>}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto">
              <div className="text-sm text-gray-500">Selected Slot</div>
              <div className="text-lg font-semibold text-gray-900">
                {slot.day} • {slot.startTime} - {slot.endTime}
              </div>
              <div className="text-xs text-gray-500">{formatDate(appointmentDate)}</div>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <button
                onClick={handleProceed}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-3 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? <><Loader2 className="animate-spin" size={18} /> Initiating...</> : <><Wallet size={18} /> {paymentMethod === "card" ? "Proceed to Payment" : "Verify Insurance"}</>}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSummary;