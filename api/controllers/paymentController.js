import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

// Create a payment
export const createPayment = async (req, res) => {
  try {
    const { patient, appointment, hospital, doctor, amount, currency, paymentType, status, transactionId, provider, notes } = req.body;

    // Optional: validate patient and appointment exist
    const appointmentExists = await Appointment.findById(appointment);
    if (!appointmentExists) return res.status(404).json({ message: 'Appointment not found' });

    const payment = new Payment({
      patient,
      appointment,
      hospital,
      doctor,
      amount,
      currency,
      paymentType,
      status,
      transactionId,
      provider,
      notes,
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name code')
      .populate('appointment');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('hospital', 'name code')
      .populate('appointment');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
