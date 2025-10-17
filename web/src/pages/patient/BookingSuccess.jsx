import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, User, Home, List, Stethoscope, MapPin } from 'lucide-react';
import api from '../../api/api';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentDetails = location.state?.confirmedAppointment;

  // Redirect if someone lands here without appointment data
  if (!appointmentDetails) {
    React.useEffect(() => {
        navigate('/');
    }, [navigate]);
    return null; 
  }

  const { doctor, timeSlot, hospital } = appointmentDetails;

  React.useEffect(() => {
    const sendConfirmationEmail = async () => {
      try {
        await api.post('/appointments/confirm', { appointmentDetails });
      } catch (error) {
        console.error('Error sending confirmation email:', error);
      }
    };

    sendConfirmationEmail();
  }, [appointmentDetails]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 flex items-center justify-center transition-all duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-8 text-center border-b border-blue-200">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-300 rounded-full blur-md opacity-60"></div>
            <CheckCircle className="relative text-green-500 mx-auto z-10" size={80} />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent mt-6">
            Appointment Confirmed!
          </h1>
          <p className="text-blue-600 text-lg mt-3 max-w-md mx-auto">
            Your booking has been successfully submitted. You will receive a confirmation email shortly.
          </p>
        </div>

        {/* Appointment Details */}
        <div className="p-8 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center justify-center gap-2">
              <Calendar size={24} />
              Appointment Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-600 font-semibold">Doctor</p>
                    <p className="text-lg font-bold text-blue-900">Dr. {doctor?.user?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Stethoscope size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-600 font-semibold">Specialty</p>
                    <p className="text-lg font-bold text-blue-900">{doctor?.specialty || 'General Practitioner'}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-600 font-semibold">Date</p>
                    <p className="text-lg font-bold text-blue-900">{timeSlot?.day || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-blue-600 font-semibold">Time</p>
                    <p className="text-lg font-bold text-blue-900">
                      {timeSlot?.startTime || 'N/A'} - {timeSlot?.endTime || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Info */}
            {hospital && (
              <div className="mt-6 flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-blue-200">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-blue-600 font-semibold">Hospital</p>
                  <p className="text-lg font-bold text-blue-900">{hospital.name}</p>
                  {hospital.location && (
                    <p className="text-blue-700 text-sm mt-1">{hospital.location}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-200 p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">What's Next?</h3>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                You will receive a confirmation email with all details
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Arrive 15 minutes before your scheduled appointment time
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Bring your ID and insurance card (if applicable)
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-blue-200 bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Home size={20} />
              Back to Home
            </Link>
            <Link 
              to="/my-appointments" 
              className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-blue-300 text-blue-700 bg-white font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-300"
            >
              <List size={20} />
              View My Appointments
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;