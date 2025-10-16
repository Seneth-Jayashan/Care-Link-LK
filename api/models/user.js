// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    profileImage: {
      type: String,
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
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
