import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, MessageSquare, Loader2, ArrowLeft, Wallet, CreditCard, Shield } from 'lucide-react';

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

  if (!bookingDetails) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Booking Summary</h1>
          
          <div className="mt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3">Select Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => setPaymentMethod('card')} className={`p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <CreditCard className={`transition ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-bold text-gray-800">Pay by Card</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Secure online payment.</p>
              </div>
              <div onClick={() => setPaymentMethod('insurance')} className={`p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'insurance' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <Shield className={`transition ${paymentMethod === 'insurance' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-bold text-gray-800">Use Insurance</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Verify your policy coverage.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <label htmlFor="reason" className="block text-lg font-semibold text-gray-800 mb-2">Reason for Visit <span className="text-red-500">*</span></label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input id="reason" type="text" value={reasonForVisit} onChange={(e) => setReasonForVisit(e.target.value)} placeholder="e.g., Annual check-up, fever..." className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition ${errors.reason ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            {errors.reason && <p className="mt-2 text-sm text-red-600">{errors.reason}</p>}
          </div>

          <div className="mt-8">
            <button onClick={handleProceed} disabled={isLoading} className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 disabled:bg-gray-400">
              {isLoading ? <><Loader2 className="animate-spin" size={22} />Initiating...</> : <><Wallet size={22} />{paymentMethod === 'card' ? 'Proceed to Payment' : 'Verify Insurance'}</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSummary;