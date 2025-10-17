import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, User, Home, List } from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentDetails = location.state?.confirmedAppointment;

  // Redirect if someone lands here without appointment data
  if (!appointmentDetails) {
    // You can navigate to home or appointments page
    useEffect(() => {
        navigate('/');
    }, [navigate]);
    return null; 
  }

  const { doctor, timeSlot } = appointmentDetails;

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-lg w-full text-center bg-white rounded-2xl shadow-xl p-8"
      >
        <CheckCircle className="mx-auto text-green-500" size={64} />
        
        <h1 className="text-3xl font-bold text-gray-800 mt-6">Appointment Confirmed!</h1>
        <p className="text-gray-600 mt-2">Your booking has been successfully submitted. You will receive a confirmation email shortly.</p>

        <div className="text-left bg-gray-50 p-6 rounded-xl border my-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Your Appointment Details</h2>
            <div className="flex items-center gap-3">
                <User className="text-gray-500" size={20} />
                <span className="font-medium text-gray-700">Dr. {doctor.user?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
                <Calendar className="text-gray-500" size={20} />
                <span className="font-medium text-gray-700">{timeSlot?.day}</span>
            </div>
            <div className="flex items-center gap-3">
                <Clock className="text-gray-500" size={20} />
                <span className="font-medium text-gray-700">{timeSlot?.startTime} - {timeSlot?.endTime}</span>
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition hover:bg-blue-700 flex items-center justify-center gap-2">
                <Home size={18} />
                Back to Home
            </Link>
            <Link to="/my-appointments" className="w-full px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg transition hover:bg-gray-200 flex items-center justify-center gap-2 border">
                <List size={18} />
                View My Appointments
            </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;