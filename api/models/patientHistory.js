// models/PatientHistory.js
import mongoose from 'mongoose';

const patientHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // links back to User
      required: true,
    },

    // Personal Info
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },

    // Medical History
    chronicDiseases: [{ type: String }], // e.g., Diabetes, Hypertension
    pastSurgeries: [{ type: String }],
    familyHistory: [{ type: String }],

    // Allergies
    allergies: [{ type: String }], // e.g., Penicillin

    // Medications
    medications: [
      {
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],

    // Lab Reports
    labReports: [
      {
        type: { type: String }, // e.g., Blood Test, X-Ray
        date: { type: Date },
        result: { type: String },
        fileUrl: { type: String }, // optional link to file
      },
    ],

    // Reference to Appointments
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment', // reference to separate Appointment model
      },
    ],

    // Additional Notes
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const PatientHistory = mongoose.model('PatientHistory', patientHistorySchema);

export default PatientHistory;
