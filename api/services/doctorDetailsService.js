// services/doctorDetailsService.js
import mongoose from 'mongoose';
import DoctorDetails from '../models/DoctorDetails.js'; 
import { NotFoundError, BadRequestError } from '../utils/errorResponse.js';


export const getAllDoctorDetailsService = async (user) => {
  let query = {};


  if (user.role !== 'admin' && user.hospital) {
    query.hospital = user.hospital;
  } else if (user.role !== 'admin' && !user.hospital) {

     console.warn(`User ${user._id} role ${user.role} has no hospital associated, returning no doctors.`);
     return []; 
  }

  return DoctorDetails.find(query)
    .populate({
      path: 'user', // Populate user details
      select: 'name email phone role hospital profileImage', 
      populate: {
        path: 'hospital', 
        select: 'name code'
      }
    })
    .populate('hospital', 'name code'); 
};


export const getDoctorDetailsByIdService = async (detailsId) => {
  if (!mongoose.Types.ObjectId.isValid(detailsId)) {
    throw new BadRequestError('Invalid DoctorDetails ID format');
  }

  const doctor = await DoctorDetails.findById(detailsId)
    .populate({ path: 'user', select: 'name email phone role hospital profileImage', populate: { path: 'hospital', select: 'name code' } })
    .populate('hospital', 'name code');

  if (!doctor) {
    throw new NotFoundError('Doctor details not found');
  }
  return doctor;
};


export const getDoctorDetailsByUserIdService = async (userId) => {
   if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError('Invalid User ID format');
  }

  const doctor = await DoctorDetails.findOne({ user: userId })
    .populate({ path: 'user', select: 'name email phone role hospital profileImage', populate: { path: 'hospital', select: 'name code' } })
    .populate('hospital', 'name code');

  if (!doctor) {
    throw new NotFoundError('Doctor details not found for this user ID');
  }
  return doctor;
};


export const updateDoctorDetailsService = async (detailsId, updates) => {
   if (!mongoose.Types.ObjectId.isValid(detailsId)) {
    throw new BadRequestError('Invalid DoctorDetails ID format');
  }

  delete updates.user;

  const doctor = await DoctorDetails.findByIdAndUpdate(detailsId, updates, {
    new: true,
    runValidators: true,
  }).populate({ path: 'user', select: 'name email phone role hospital profileImage' })
    .populate('hospital', 'name code');

  if (!doctor) {
    throw new NotFoundError('Doctor details not found');
  }
  return doctor;
};


export const deleteDoctorDetailsService = async (detailsId) => {
   if (!mongoose.Types.ObjectId.isValid(detailsId)) {
    throw new BadRequestError('Invalid DoctorDetails ID format');
  }

  const doctor = await DoctorDetails.findByIdAndDelete(detailsId);

  if (!doctor) {
    throw new NotFoundError('Doctor details not found');
  }

  return { message: 'Doctor details deleted successfully' };
};