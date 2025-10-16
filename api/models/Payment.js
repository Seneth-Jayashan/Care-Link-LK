// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // should be role 'patient'
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // optional, for doctor fees
    },

    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'LKR',
    },

    paymentType: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'online', 'other'],
      default: 'cash',
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    transactionId: { type: String }, // optional, for online/card payments
    provider: { type: String }, // e.g., PayPal, Stripe, bank name, insurance provider

    notes: { type: String }, // optional
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
