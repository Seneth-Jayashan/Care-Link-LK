import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, Loader2, FileText } from 'lucide-react';

const InsuranceVerificationPage = () => {
    const { appointmentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [appointment, setAppointment] = useState(location.state?.appointment);
    const [bookingDetails, setBookingDetails] = useState(location.state?.bookingDetails);
    const [policyNumber, setPolicyNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!appointment) navigate('/patient/doctors');
    }, [appointment, navigate]);

    const handleVerifyInsurance = async () => {
        if (!policyNumber.trim()) {
            setError('Please enter your policy number.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            // Simulate the delay of a real verification process
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const policy = policyNumber.trim().toUpperCase();
            
            // --- NEW VALIDATION LOGIC ---

            // Rule 1: Full Coverage (Government or Employee)
            if (policy.startsWith('G') || policy.startsWith('E')) {
                const paymentData = {
                    patient: user.id,
                    appointment: appointment._id,
                    amount: bookingDetails.consultationFee, // Record the full covered amount
                    paymentType: 'insurance',
                    status: 'paid',
                    provider: `Full Coverage Policy #${policyNumber}`,
                };
                await api.post('/payments', paymentData);

                const finalUpdate = { paymentStatus: 'paid', status: 'confirmed' };
                const finalAppointmentRes = await api.put(`/appointments/${appointment._id}`, finalUpdate);
                
                navigate('/patient/booking-success', { state: { confirmedAppointment: finalAppointmentRes.data }, replace: true });
                return; // End the function here
            }

            // Rule 2 & 3: Partial Coverage (Odd/Even Check)
            const numberMatch = policy.match(/\d+/);
            if (!numberMatch) {
                throw new Error('Invalid policy format. Must contain numbers.');
            }
            
            const numberPart = parseInt(numberMatch[0], 10);
            let coPaymentAmount;

            if (numberPart % 2 !== 0) {
                // Odd number = Half Coverage (50% co-pay)
                coPaymentAmount = bookingDetails.consultationFee * 0.5;
            } else {
                // Even number = Partial Coverage (30% co-pay)
                coPaymentAmount = bookingDetails.consultationFee * 0.3;
            }

            // Navigate to payment page with the calculated co-payment
            navigate(`/patient/payment/${appointment._id}`, {
                state: { appointment, bookingDetails, coPaymentAmount, policyNumber }, // Pass policyNumber for context
                replace: true
            });

        } catch (err) {
            console.error("Verification failed:", err);
            setError(err.message || 'Could not verify insurance. Please check your details or pay by card.');
            setIsLoading(false);
        }
    };

    if (!bookingDetails) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Insurance Verification</h1>
                    <p className="text-gray-500 mt-2">Enter your policy details to confirm coverage.</p>
                </div>
                
                <div className="mt-8">
                    <label htmlFor="policy" className="text-sm font-medium text-gray-700">Policy Number</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            id="policy"
                            type="text"
                            value={policyNumber}
                            onChange={(e) => setPolicyNumber(e.target.value)}
                            placeholder="e.g., INS-12345 or G-7890"
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {error && <p className="text-red-600 text-center mt-4 bg-red-50 p-3 rounded-lg">{error}</p>}

                <div className="mt-8">
                    <button onClick={handleVerifyInsurance} disabled={isLoading} className="w-full px-8 py-4 bg-green-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-3 shadow-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? ( <><Loader2 className="animate-spin"/>Verifying...</> ) : ( <><ShieldCheck/>Verify Coverage</> )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default InsuranceVerificationPage;