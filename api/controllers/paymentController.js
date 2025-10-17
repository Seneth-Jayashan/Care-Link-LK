import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
export const createPayment = asyncHandler(async (req, res) => {
    const { patient, appointment, hospital, doctor, amount, paymentType, status, transactionId } = req.body;

    // CHANGED: More robust validation
    if (!patient || !appointment || !amount) {
        res.status(400);
        throw new Error('Patient, appointment, and amount are required.');
    }

    const appointmentExists = await Appointment.findById(appointment);
    if (!appointmentExists) {
        res.status(404);
        throw new Error('Associated appointment not found');
    }

    const payment = new Payment({
        patient,
        appointment,
        hospital,
        doctor,
        amount,
        paymentType,
        status,
        transactionId,
    });

    const createdPayment = await payment.save();
    res.status(201).json(createdPayment);
});

// @desc    Get payments based on user role
// @route   GET /api/payments
// @access  Private
export const getPayments = asyncHandler(async (req, res) => {
    let query = {};

    // CHANGED: Role-based data filtering for security
    const { role, _id } = req.user;

    if (role === 'patient') {
        query.patient = _id;
    } else if (role === 'doctor') {
        query.doctor = _id;
    } else if (role === 'hospitaladmin' && req.user.hospital) {
        query.hospital = req.user.hospital;
    }

    const payments = await Payment.find(query)
        .populate('patient', 'name email')
        .populate('doctor', 'name email')
        .populate('appointment', 'appointmentDate reason')
        .sort({ createdAt: -1 });

    res.json(payments);
});

// @desc    Get a single payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
        .populate('patient', 'name email')
        .populate('doctor', 'name email')
        .populate('appointment');

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }
    
    // NEW: Security check
    const { role, _id } = req.user;
     if (role !== 'admin' &&
        payment.patient._id.toString() !== _id.toString() &&
        payment.doctor._id.toString() !== _id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this payment');
    }

    res.json(payment);
});

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }
    
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updatedPayment);
});

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    await payment.deleteOne();
    res.json({ message: 'Payment removed successfully' });
});