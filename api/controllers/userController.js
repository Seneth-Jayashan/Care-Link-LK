import User from '../models/user.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import Appointment from '../models/Appointment.js';
import Hospital from '../models/Hospital.js';
import fs from 'fs';
import asyncHandler from 'express-async-handler';
import { createUserService } from '../services/userService.js';

export const createUser = asyncHandler(async (req, res) => {
  const { message, user } = await createUserService(req.body, req.file, req.user);
  
  res.status(201).json({ message, user });
});

export const getUsers = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'hospitaladmin') {
    filter.hospital = req.user.hospital;
  }

  const users = await User.find(filter)
    .populate('patientHistory')
    .populate('doctorDetails')
    .populate('hospital');

  res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('patientHistory')
    .populate('doctorDetails')
    .populate('hospital');
    
  if (!user) {
    res.status(404);
    throw new Error('User not found'); // asyncHandler will catch this
  }
  res.json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
     res.status(404);
     throw new Error('User not found');
  }

  const { name, email, phone, role, specialty } = req.body;
  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.role = role || user.role;

  // Handle profile image
  if (req.file) {
    if (user.profileImage && fs.existsSync(user.profileImage)) {
      fs.unlinkSync(user.profileImage);
    }
    user.profileImage = req.file.path;
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
        hospital
      });

  if (user.role === 'doctor' && specialty) {
    const doctorDetails = await DoctorDetails.findOne({ user: user._id });
    if (doctorDetails) {
      doctorDetails.specialty = specialty;
      await doctorDetails.save();
    }
  }

  res.json(updatedUser);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ message: 'User deleted successfully' });
});

export const getLoggedUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('hospital');

  if (!user) {
     res.status(404);
     throw new Error('User not found');
  }

  let doctors = 0;
  let patients = 0;

  if (user.hospital) {
    doctors = await DoctorDetails.countDocuments({ hospital: user.hospital._id });
    const patientIds = await Appointment.distinct('patient', {
      hospital: user.hospital._id,
      status: { $in: ['pending', 'confirmed'] },
    });
    patients = patientIds.length;
  }

  res.json({ user, hospital: user.hospital, doctors, patients });
});