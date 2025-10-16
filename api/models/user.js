// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'hospitaladmin', 'admin'], 
      default: 'patient',
    },

    // Conditional references
    patientHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientHistory',
      required: function() {
        return this.role === 'patient';
      },
    },
    doctorDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorDetails',
      required: function() {
        return this.role === 'doctor';
      },
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: function() {
        return this.role === 'hospitaladmin';
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
