import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { X, Stethoscope, Building, Award, Languages, Calendar, Clock, CheckCircle, ShieldCheck, Loader2 } from "lucide-react";

const DoctorDetailModal = ({ doctor, onClose }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingDirectly, setIsBookingDirectly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const userDetails = doctor.user || {};
  const hospitalDetails = doctor.hospital || {};
  const API_BASE_URL = "http://localhost:3001";
  const imageUrl = `${API_BASE_URL}/${(userDetails.profileImage || "").replace(/\\/g, "/")}`;

  // Direct booking for government-covered appointments
  const handleDirectBook = async () => {
    if (!selectedSlot || !hospitalDetails) return;
    setIsBookingDirectly(true);

    try {
      const appointmentDate = new Date();
      const appointmentData = {
        patient: user._id,
        doctor: userDetails._id,
        hospital: hospitalDetails._id,
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: selectedSlot.startTime,
        reason: "Government Hospital Booking",
        status: 'confirmed',
        paymentStatus: 'paid'
      };
      const appointmentRes = await api.post('/appointments', appointmentData);
      const newAppointment = appointmentRes.data;

      const paymentData = {
        patient: user._id,
        appointment: newAppointment._id,
        hospital: hospitalDetails._id,
        amount: 0,
        paymentType: 'coverage',
        status: 'paid',
        provider: 'Government Coverage'
      };
      await api.post('/payments', paymentData);

      navigate('/patient/booking-success', {
        state: { confirmedAppointment: newAppointment },
        replace: true
      });
    } catch (err) {
      console.error("Direct booking failed:", err);
      setIsBookingDirectly(false);
    }
  };

  // Standard booking for private hospitals
  const handleProceedToBooking = () => {
    if (!selectedSlot) return;
    navigate('/patient/booking-summary', {
      state: {
        doctorId: userDetails._id,
        doctorName: userDetails.name,
        specialty: doctor.specialty,
        consultationFee: doctor.consultationFee,
        hospitalId: hospitalDetails._id,
        selectedSlot: selectedSlot
      }
    });
  };

  const isGovernmentHospital = hospitalDetails?.type === 'government';

  const InfoTag = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 text-gray-600">
      <Icon className="text-blue-500" size={20} />
      <span>{text}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={imageUrl} alt={userDetails.name} className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dr. {userDetails.name}</h2>
                <p className="text-gray-600">{doctor.qualifications?.join(', ') || 'MBBS'}</p>
                <div className="mt-1 bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full flex items-center gap-2 text-sm w-fit">
                  <Stethoscope size={16} />
                  <span>{doctor.specialty}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoTag icon={Building} text={hospitalDetails.name || 'Private Practice'} />
            <InfoTag icon={Award} text={`${doctor.yearsOfExperience || 1}+ years experience`} />
            <InfoTag icon={Languages} text={`Speaks: ${doctor.languages?.join(', ') || 'English, Sinhala'}`} />
          </div>
          {doctor.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About Dr. {userDetails.name}</h3>
              <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={20} /> Select an Available Time Slot
            </h3>
            {doctor.schedule && doctor.schedule.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {doctor.schedule.map(slot => (
                  <button
                    key={slot._id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border-2 text-center transition ${selectedSlot?._id === slot._id ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600'}`}
                  >
                    <p className="font-semibold">{slot.day}</p>
                    <p className="text-sm flex items-center justify-center gap-1 mt-1">
                      <Clock size={14} />
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">No schedule available for this doctor.</p>
            )}
          </div>
        </div>
        <div className="p-6 border-t sticky bottom-0 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <p className="text-gray-600">Consultation Fee</p>
              <p className="text-2xl font-bold text-gray-900">
                {isGovernmentHospital ? "Covered" : `LKR ${doctor.consultationFee?.toLocaleString() || 'N/A'}`}
              </p>
            </div>
            <button
              onClick={isGovernmentHospital ? handleDirectBook : handleProceedToBooking}
              disabled={!selectedSlot || isBookingDirectly}
              className={`w-full sm:w-auto mt-4 sm:mt-0 px-8 py-3 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed ${isGovernmentHospital ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isBookingDirectly ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {isGovernmentHospital ? 'Book Now (Govt. Covered)' : 'Proceed to Book'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorDetailModal;