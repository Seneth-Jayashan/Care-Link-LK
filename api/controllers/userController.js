// controllers/userController.js
import User from '../models/user.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import Appointment from '../models/Appointment.js';
import { generatePatientQR } from '../utils/qrGenerator.js';
import { sendEmailWithQR } from '../utils/sendEmail.js';
import Hospital from '../models/Hospital.js';
import fs from 'fs';

// Create User
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      chronicDiseases = [],
      pastSurgeries = [],
      familyHistory = [],
      allergies = [],
      medications = [],
      notes,
      specialty,
      qualifications,
      yearsOfExperience,
      consultationFee,
      schedule,
      languages,
      bio,
    } = req.body;

    const hospital = role !== 'hospitaladmin' ? req.user?.hospital : null;

    const user = new User({ name, email, password, phone, role, hospital });

    if (req.file) user.profileImage = req.file.path;

    // ------------------- PATIENT -------------------
    if (role === 'patient') {
      // Ensure arrays are properly parsed if coming as JSON strings
      const parseArray = (field) => {
        if (!field) return [];
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return field.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
        return field;
      };
      const history = new PatientHistory({
        user: user._id,
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        emergencyContact,
        chronicDiseases: parseArray(chronicDiseases),
        pastSurgeries: parseArray(pastSurgeries),
        familyHistory: parseArray(familyHistory),
        allergies: parseArray(allergies),
        currentMedications: parseArray(medications),
        notes: notes || '',
        createdAt: new Date(),
      });

      await history.save();
      user.patientHistory = history._id;
      await user.save();

      // Generate QR and send email
      const qrCodeDataUrl = await generatePatientQR({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        patientHistoryId: history._id,
      });

      await sendEmailWithQR(user.email, 'Your Patient Account QR', qrCodeDataUrl, password);

      return res.status(201).json({
        message: '✅ Patient created and email sent successfully!',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          patientHistory: history._id,
        },
      });
    }

    // ------------------- DOCTOR -------------------
    if (role === 'doctor') {
      const doctorDetails = new DoctorDetails({
        user: user._id,
        specialty,
        qualifications,
        yearsOfExperience,
        consultationFee,
        schedule: schedule ? JSON.parse(schedule) : [],
        languages,
        bio,
        notes: notes || '',
        profileImage: req.file ? req.file.path : null,
        hospital,
      });

      await doctorDetails.save();
      user.doctorDetails = doctorDetails._id;
      await user.save();

      return res.status(201).json({
        message: '✅ Doctor created successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          doctorDetails: doctorDetails._id,
        },
      });
    }

    // ------------------- OTHER ROLES -------------------
    await user.save();
    return res.status(201).json({
      message: `✅ ${role} created successfully`,
      user,
    });

  } catch (err) {
    console.error('❌ Error in createUser:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// --------------------
// GET ALL USERS
// --------------------
export const getUsers = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'hospitaladmin') {
      filter.hospital = req.user.hospital; // filter only users in their hospital
    }

    const users = await User.find(filter)
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
    const {id} = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if(user.role === 'patient'){
      await PatientHistory.findOneAndDelete({user:id});
    }else if(user.role === 'doctor'){
      await DoctorDetails.findOneAndDelete({user: id});
    }else if(user.role === 'hospitaladmin'){
      await Hospital.findByIdAndDelete({hospitalAdmins:id});
    }

    // Delete profile image if exists
    if (user.profileImage && fs.existsSync(user.profileImage)) fs.unlinkSync(user.profileImage);


    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



export const getLoggedUser = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('hospital');

    if (!user) return res.status(404).json({ message: 'User not found' });

    let doctors = 0;
    let patients = 0;

    if (user.hospital) {
      // Count doctors in this hospital
      doctors = await DoctorDetails.countDocuments({ hospital: user.hospital._id });

      // Count unique patients with appointments in this hospital with status pending or confirmed
      const patientIds = await Appointment.distinct('patient', {
        hospital: user.hospital._id,
        status: { $in: ['pending', 'confirmed'] },
      });
      patients = patientIds.length;
    }

    res.json({ user, hospital: user.hospital, doctors, patients });
  } catch (err) {
    console.error('Error in /me:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



