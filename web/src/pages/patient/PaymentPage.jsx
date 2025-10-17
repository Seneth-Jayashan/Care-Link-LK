import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, Calendar, Lock, User, ShieldCheck, Loader2, ArrowLeft, Wallet, Building, Stethoscope } from 'lucide-react';

const PaymentPage = () => {
    const { appointmentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [appointment, setAppointment] = useState(location.state?.appointment);
    const [bookingDetails, setBookingDetails] = useState(location.state?.bookingDetails);
    const coPaymentAmount = location.state?.coPaymentAmount;
    const amountToPay = coPaymentAmount || bookingDetails?.consultationFee;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '', name: '' });

    useEffect(() => {
        if (!appointment || !bookingDetails) {
            navigate('/patient/doctors');
        }
    }, [appointment, bookingDetails, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePayNow = async () => {
        setIsLoading(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const paymentData = {
                patient: user.id, 
                appointment: appointment._id, 
                doctor: bookingDetails.doctorId, 
                hospital: bookingDetails.hospitalId,
                amount: amountToPay,
                paymentType: 'card',
                status: 'paid',
                transactionId: `ch_sim_${Date.now()}`,
                provider: 'Simulated Gateway',
                notes: coPaymentAmount ? `Co-payment after insurance. Full fee: ${bookingDetails.consultationFee}` : "Standard card payment",
            };
            await api.post('/payments', paymentData);
            
            const finalUpdateData = { paymentStatus: 'paid', status: 'confirmed' };
            const finalAppointmentResponse = await api.put(`/appointments/${appointment._id}`, finalUpdateData);
            
            navigate('/patient/booking-success', { 
                state: { confirmedAppointment: finalAppointmentResponse.data }, 
                replace: true 
            });
        } catch (err) {
            console.error("Payment failed:", err);
            setError(err.response?.data?.message || 'Payment could not be processed.');
            setIsLoading(false);
        }
    };

    if (!appointment) return (
        <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex items-center justify-center">
            <p className="text-center text-gray-500 text-lg animate-pulse">Loading payment details...</p>
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
                            Secure Payment
                        </h1>
                    </div>
                    <p className="text-blue-600 mt-2">Complete your payment for Dr. {bookingDetails.doctorName}</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Appointment Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
                        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <Wallet size={20} />
                            Payment Summary
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

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <CreditCard size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-semibold">
                                            {coPaymentAmount ? 'Co-payment Amount' : 'Consultation Fee'}
                                        </p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            LKR {amountToPay?.toLocaleString()}
                                        </p>
                                        {coPaymentAmount && (
                                            <p className="text-xs text-blue-600">
                                                Full fee: LKR {bookingDetails.consultationFee?.toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                            <ShieldCheck size={20} />
                            Card Details
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-2">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20}/>
                                    <input 
                                        type="text" 
                                        name="number" 
                                        onChange={handleInputChange} 
                                        placeholder="1234 5678 9101 1121" 
                                        className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                                    />
                                </div>
                            </div>

                            {/* Expiry and CVC */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-2">Expiry Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20}/>
                                        <input 
                                            type="text" 
                                            name="expiry" 
                                            onChange={handleInputChange} 
                                            placeholder="MM / YY" 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-2">CVC</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20}/>
                                        <input 
                                            type="text" 
                                            name="cvc" 
                                            onChange={handleInputChange} 
                                            placeholder="123" 
                                            className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cardholder Name */}
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-2">Cardholder Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20}/>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        onChange={handleInputChange} 
                                        placeholder="Full Name as on Card" 
                                        className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-blue-50/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Pay Now Button */}
                    <div className="pt-4">
                        <button
                            onClick={handlePayNow}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={24} />
                                    Pay LKR {amountToPay?.toLocaleString()}
                                </>
                            )}
                        </button>
                        
                        {/* Security Note */}
                        <div className="text-center mt-4">
                            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                                <Lock size={14} />
                                <span>Your payment is secure and encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentPage;