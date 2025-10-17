import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, Calendar, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';

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
                patient: user.id, appointment: appointment._id, doctor: bookingDetails.doctorId, hospital: bookingDetails.hospitalId,
                amount: amountToPay,
                paymentType: 'card', // Always card on this page
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

    if (!appointment) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800">Secure Payment</h1>
                        <p className="text-gray-500 mt-2">Enter your card details for Dr. {bookingDetails.doctorName}</p>
                    </div>
                    <div className="my-8 p-4 bg-blue-50/50 rounded-xl flex justify-between items-center border">
                        <span className="text-gray-600 font-medium">{coPaymentAmount ? 'Co-payment Amount' : 'Amount to Pay'}</span>
                        <span className="text-2xl font-bold text-gray-900">LKR {amountToPay?.toLocaleString()}</span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input type="text" name="number" onChange={handleInputChange} placeholder="1234 5678 9101 1121" className="w-full pl-10 pr-4 py-3 border rounded-lg"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input type="text" name="expiry" onChange={handleInputChange} placeholder="MM / YY" className="w-full pl-10 pr-4 py-3 border rounded-lg"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">CVC</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input type="text" name="cvc" onChange={handleInputChange} placeholder="123" className="w-full pl-10 pr-4 py-3 border rounded-lg"/>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Cardholder Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input type="text" name="name" onChange={handleInputChange} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 border rounded-lg"/>
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-center mt-4">{error}</p>}
                    <div className="mt-8">
                        <button onClick={handlePayNow} disabled={isLoading} className="w-full px-8 py-4 bg-green-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-3 shadow-lg hover:bg-green-700 disabled:bg-gray-400">
                            {isLoading ? ( <><Loader2 className="animate-spin" size={22} />Processing...</> ) : ( <><ShieldCheck size={22} />Pay LKR {amountToPay?.toLocaleString()}</> )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentPage;