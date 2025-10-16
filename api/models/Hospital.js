// models/Hospital.js
import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      required: true, // e.g., HOSP001
    },
    address: {
      street: { type: String },
      city: { type: String },
      district: { type: String },
      province: { type: String },
      postalCode: { type: String },
      country: { type: String, default: 'Sri Lanka' },
    },
    contact: {
      phone: { type: String },
      email: { type: String },
    },
    departments: [
      {
        name: { type: String },
        description: { type: String },
      },
    ],

    // Staff references
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // only users with role: 'doctor'
      },
    ],
    hospitalAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // only users with role: 'hospitaladmin'
      },
    ],

    // Optional hospital info
    bedCapacity: { type: Number, default: 0 },
    facilities: [{ type: String }], // e.g., ICU, Radiology, Pharmacy
    rating: { type: Number, min: 0, max: 5, default: 0 },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
