// controllers/userController.js
import User from '../models/user.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import { generatePatientQR } from '../utils/qrGenerator.js';
import { sendEmailWithQR } from '../utils/sendEmail.js';
import fs from 'fs';
import Hospital from '../models/Hospital.js';

// Create User
export const createUser = async (req, res) => {
  try {

    const { name, email, password, phone, role } = req.body;

    const user = new User({ name, email, password, phone, role });

    if (req.file) user.profileImage = req.file.path;

    // ------------------- PATIENT -------------------
    if (role === 'patient') {
      const history = new PatientHistory({ user: user._id });
      await history.save();
      user.patientHistory = history._id;
      await user.save();

      const patientData = {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        patientHistoryId: history._id,
      };
      const qrCodeDataUrl = await generatePatientQR(patientData);

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

    if (role === 'doctor') {
      const {
        specialty,
        qualifications,
        yearsOfExperience,
        consultationFee,
        schedule,
        languages,
        bio,
        notes
      } = req.body;

      const hospital = req.user.hospital; // securely get hospital from logged-in user
      const profilePicture = req.file ? req.file.path : null;

      const doctorDetails = new DoctorDetails({
        user: user._id,
        specialty,
        qualifications,
        yearsOfExperience,
        consultationFee,
        schedule: JSON.parse(schedule), // schedule comes as JSON string
        languages,
        bio,
        notes,
        profileImage:profilePicture,
        hospital
      });

      await doctorDetails.save();
      user.doctorDetails = doctorDetails._id;
      await user.save();

      return res.status(201).json({
        message: 'Doctor created successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          doctorDetails: doctorDetails._id
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
    const {id} = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log(user);
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
