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


    hospitalAdmins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],

    licenseDocument: {
      type: String,
    },

    // Optional hospital info
    bedCapacity: { type: Number, default: 0 },
    facilities: [{ type: String }], // e.g., ICU, Radiology, Pharmacy
    rating: { type: Number, min: 0, max: 5, default: 0 },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for doctors
hospitalSchema.virtual('doctors', {
  ref: 'User',
  localField: '_id',
  foreignField: 'hospital',
  justOne: false,
  match: { role: 'doctor' }
});

hospitalSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      const User = mongoose.model('User');
      // Set hospital field to null for ALL users (admins, doctors)
      // who were associated with this hospital.
      await User.updateMany(
        { hospital: doc._id },
        { $set: { hospital: null } }
      );
    } catch (err) {
      console.error('Error in hospital post-delete hook:', err);
    }
  }
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
