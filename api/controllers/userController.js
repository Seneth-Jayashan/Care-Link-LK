// controllers/userController.js
import User from '../models/User.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import { generatePatientQR } from '../utils/qrGenerator.js';
import { sendEmailWithQR } from '../utils/sendEmail.js';
import fs from 'fs';

// Create User
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, specialty } = req.body;

    // Create user with provided password (no hash yet, will hash in pre-save hook)
    const user = new User({ name, email, password, phone, role });

    // Handle profile image
    if (req.file) user.profileImage = req.file.path;

    // ------------------- PATIENT -------------------
    if (role === 'patient') {
      // Create PatientHistory
      const history = new PatientHistory({ user: user._id });
      await history.save();
      user.patientHistory = history._id;
      await user.save();

      // Generate QR code containing patient info
      // Recommendation: Only include user._id in the QR code for better security
      const patientData = {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        patientHistoryId: history._id,
      };
      const qrCodeDataUrl = await generatePatientQR(patientData);

      // Send email with credentials + QR
      // CRITICAL: Avoid sending the password. Send a password-reset or account-activation link instead.
      await sendEmailWithQR(user.email, 'Your Patient Account QR', qrCodeDataUrl, password);

      return res.status(201).json({
        message: 'Patient created and email sent successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    }

    // ------------------- DOCTOR -------------------
    if (role === 'doctor') {
      const doctorDetails = new DoctorDetails({ user: user._id, specialty: specialty || '' });
      await doctorDetails.save();
      user.doctorDetails = doctorDetails._id;
      await user.save();
      
      // FIX: Added 'return' to prevent fall-through and sending a second response.
      return res.status(201).json({
        message: `${role} created successfully`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // ------------------- HOSPITAL ADMIN / OTHERS -------------------
    // This part will now only be reached for roles other than 'patient' and 'doctor'
    await user.save(); // Save user if not already saved in a specific role block
    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --------------------
// GET ALL USERS
// --------------------
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('patientHistory')
      .populate('doctorDetails')
      .populate('hospital');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --------------------
// GET SINGLE USER BY ID
// --------------------
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('patientHistory')
      .populate('doctorDetails')
      .populate('hospital');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --------------------
// UPDATE USER
// --------------------
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, phone, role, specialty } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;

    // Handle profile image
    if (req.file) {
      if (user.profileImage && fs.existsSync(user.profileImage)) fs.unlinkSync(user.profileImage);
      user.profileImage = req.file.path;
    }

    await user.save();

    // Update doctorDetails if role is doctor
    if (role === 'doctor' && specialty) {
      const doctorDetails = await DoctorDetails.findOne({ user: user._id });
      if (doctorDetails) {
        doctorDetails.specialty = specialty;
        await doctorDetails.save();
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --------------------
// DELETE USER
// --------------------
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete profile image if exists
    if (user.profileImage && fs.existsSync(user.profileImage)) fs.unlinkSync(user.profileImage);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
