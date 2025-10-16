// models/DoctorDetails.js
import mongoose from 'mongoose';

const doctorDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // links to User with role 'doctor'
      required: true,
    },

    // Professional Info
    specialty: { type: String, required: true }, // e.g., Cardiology
    qualifications: [{ type: String }], // e.g., MBBS, MD
    yearsOfExperience: { type: Number, default: 0 },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital', // hospital affiliation
    },
    consultationFee: { type: Number, default: 0 },

    // Work Schedule (optional)
    schedule: [
      {
        day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
        startTime: { type: String }, // e.g., '09:00'
        endTime: { type: String },   // e.g., '17:00'
      },
    ],

    // Additional Info
    languages: [{ type: String }], // e.g., English, Sinhala
    bio: { type: String },
    profilePicture: { type: String }, // URL
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const DoctorDetails = mongoose.model('DoctorDetails', doctorDetailsSchema);

export default DoctorDetails;
