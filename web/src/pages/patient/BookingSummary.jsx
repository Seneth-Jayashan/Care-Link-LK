import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, MessageSquare, Loader2, ArrowLeft, Wallet, CreditCard, Shield, Building, Stethoscope, MapPin } from 'lucide-react';

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

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingDetails, setBookingDetails] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!location.state?.doctorId) {
      navigate('/patient/doctors');
    } else {
      setBookingDetails(location.state);
    }
  }, [location, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!reasonForVisit.trim()) {
      newErrors.reason = "Please provide a reason for your visit.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const appointmentDate = getNextDayOfWeek(bookingDetails.selectedSlot.day);
      const appointmentData = {
        patient: user.id,
        doctor: bookingDetails.doctorId,
        hospital: bookingDetails.hospitalId,
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: bookingDetails.selectedSlot.startTime,
        reason: reasonForVisit,
        status: 'pending',
        paymentStatus: 'unpaid',
      };
      const appointmentRes = await api.post('/appointments', appointmentData);
      const newAppointment = appointmentRes.data;

      if (paymentMethod === 'card') {
        navigate(`/patient/payment/${newAppointment._id}`, {
          state: { appointment: newAppointment, bookingDetails: bookingDetails },
          replace: true
        });
      } else if (paymentMethod === 'insurance') {
        navigate(`/patient/insurance-verification/${newAppointment._id}`, {
          state: { appointment: newAppointment, bookingDetails: bookingDetails },
          replace: true
        });
      }
    } catch (err) {
      console.error("Failed to create pending appointment:", err);
      setErrors({ api: err.response?.data?.message || 'Could not initiate booking. Please try again.' });
      setIsLoading(false);
    }
  };

  if (!bookingDetails) return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
      <p className="text-center text-gray-500 text-lg animate-pulse">Loading booking details...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 flex items-center justify-center transition-all duration-500">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-6 border-b border-blue-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:scale-105 transition-all duration-300 font-semibold"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
              Booking Summary
            </h1>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Appointment Details Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Appointment Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Doctor</p>
                    <p className="text-lg font-bold text-blue-900">Dr. {bookingDetails.doctorName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Stethoscope size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Specialty</p>
                    <p className="text-lg font-bold text-blue-900">{bookingDetails.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Date & Time</p>
                    <p className="text-lg font-bold text-blue-900">
                      {bookingDetails.selectedSlot.day} • {bookingDetails.selectedSlot.startTime}
                    </p>
                  </div>
                </div>

                {bookingDetails.consultationFee && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wallet size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Consultation Fee</p>
                      <p className="text-lg font-bold text-blue-900">
                        LKR {bookingDetails.consultationFee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <CreditCard size={20} />
              Payment Method
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  paymentMethod === 'card'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-600 shadow-lg scale-105'
                    : 'bg-white text-blue-900 border-blue-200 hover:border-blue-400 hover:shadow-md hover:scale-105'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={24} className={paymentMethod === 'card' ? 'text-white' : 'text-blue-600'} />
                  <span className="font-bold text-lg">Pay by Card</span>
                </div>
                <p className={paymentMethod === 'card' ? 'text-blue-100' : 'text-blue-600'}>
                  Secure online payment
                </p>
              </button>

              <button
                onClick={() => setPaymentMethod('insurance')}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  paymentMethod === 'insurance'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-600 shadow-lg scale-105'
                    : 'bg-white text-blue-900 border-blue-200 hover:border-blue-400 hover:shadow-md hover:scale-105'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={24} className={paymentMethod === 'insurance' ? 'text-white' : 'text-blue-600'} />
                  <span className="font-bold text-lg">Use Insurance</span>
                </div>
                <p className={paymentMethod === 'insurance' ? 'text-blue-100' : 'text-blue-600'}>
                  Verify your policy coverage
                </p>
              </button>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="space-y-4">
            <label htmlFor="reason" className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <MessageSquare size={20} />
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-blue-400" size={20} />
              <textarea
                id="reason"
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="Please describe the reason for your visit (e.g., Annual check-up, fever, follow-up consultation...)"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 min-h-[120px] resize-none ${
                  errors.reason ? 'border-red-500 bg-red-50' : 'border-blue-200 bg-blue-50/50'
                }`}
              />
            </div>
            {errors.reason && (
              <p className="text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 text-sm">
                {errors.reason}
              </p>
            )}
          </div>

          {/* API Error */}
          {errors.api && (
            <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 text-sm">
              {errors.api}
            </div>
          )}

          {/* Proceed Button */}
          <div className="pt-4">
            <button
              onClick={handleProceed}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Initiating Booking...
                </>
              ) : (
                <>
                  <Wallet size={24} />
                  {paymentMethod === 'card' ? 'Proceed to Payment' : 'Verify Insurance'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSummary;