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

userSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      console.log(`Cleaning up after deleting user: ${doc.name}`);

      // We use mongoose.model('ModelName') to avoid circular import errors
      const PatientHistory = mongoose.model('PatientHistory');
      const DoctorDetails = mongoose.model('DoctorDetails');
      const Hospital = mongoose.model('Hospital');

      // 1. Delete related documents
      if (doc.role === 'patient') {
        await PatientHistory.findOneAndDelete({ user: doc._id });
      } else if (doc.role === 'doctor') {
        await DoctorDetails.findOneAndDelete({ user: doc._id });
      } else if (doc.role === 'hospitaladmin') {
        // Pull this admin's ID from any hospital admin arrays
        await Hospital.updateMany(
          { hospitalAdmins: doc._id },
          { $pull: { hospitalAdmins: doc._id } }
        );
      }
      
      // 2. Delete profile image from filesystem
      if (doc.profileImage && fs.existsSync(doc.profileImage)) {
        fs.unlinkSync(doc.profileImage);
        console.log(`Deleted profile image: ${doc.profileImage}`);
      }
    } catch (err) {
      // The console.error from your log is coming from here
      console.error('Error in user post-delete hook:', err);
    }
  }
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
