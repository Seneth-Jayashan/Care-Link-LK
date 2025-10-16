// models/Appointment.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // should have role 'patient'
      required: true,
    },
    patientHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientHistory',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // should have role 'doctor'
      required: true,
    },
    doctorDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorDetails',
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String, // e.g., '09:30'
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    reason: {
      type: String, // reason for appointment
    },
    notes: {
      type: String, // doctor or patient notes
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'pending'],
      default: 'unpaid',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
