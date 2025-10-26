// services/patientHistoryService.js
import mongoose from 'mongoose';
import PatientHistory from '../models/PatientHistory.js';
import User from '../models/user.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errorResponse.js'; // Adjust path if needed

/**
 * Gets all patient histories (accessible by admin, doctor, hospitaladmin).
 */
export const getAllPatientHistoriesService = async (user) => {
  // Authorization is handled by route middleware.
  // We might add filtering here later if needed (e.g., hospital admin sees only their hospital's patients)
  return PatientHistory.find()
    .populate('user', 'name email phone role hospital') // Populate more user info
    .populate('appointments'); // Keep appointments populated
};

/**
 * Gets a single patient history by ID with security checks.
 */
export const getPatientHistoryByIdService = async (historyId, user) => {
  if (!mongoose.Types.ObjectId.isValid(historyId)) {
    throw new BadRequestError('Invalid Patient History ID format');
  }

  const history = await PatientHistory.findById(historyId)
    .populate('user', 'name email phone role hospital')
    .populate('appointments');

  if (!history) {
    throw new NotFoundError('Patient history not found');
  }

  // Security Check: Patient can only view their own history.
  const { role, _id } = user;
  if (role === 'patient' && history.user._id.toString() !== _id.toString()) {
    throw new ForbiddenError('Access denied: You can only view your own history.');
  }

  // Admins, Doctors, Hospital Admins are allowed by route middleware.
  return history;
};

/**
 * Gets a patient history by the patient's email.
 */
export const getPatientByEmailService = async (email, user) => {
  const patientUser = await User.findOne({ email, role: 'patient' }); 

  if (!patientUser) {
    throw new NotFoundError('User not found with that email or is not a patient');
  }

  if (!patientUser.patientHistory) {
    throw new NotFoundError('Patient has no history record');
  }

  const history = await PatientHistory.findById(patientUser.patientHistory)
     .populate('user', 'name email phone role hospital')
     .populate('appointments');

  if (!history) {
     console.error(`Data inconsistency: User ${email} links to missing history ${patientUser.patientHistory}`);
     throw new NotFoundError(`Patient history record not found for ID ${patientUser.patientHistory}`);
  }

  return history; 
};



export const getPatientByQRCodeService = async (patientHistoryId, user) => {
  if (!mongoose.Types.ObjectId.isValid(patientHistoryId)) {
    throw new BadRequestError('Invalid patientHistoryId format');
  }

  const patientHistory = await PatientHistory.findById(patientHistoryId)
    .populate('user', 'name email phone role hospital') 
    .populate('appointments'); 

  if (!patientHistory) {
    throw new NotFoundError('Patient history not found for the provided ID');
  }

  return patientHistory;
};


export const updatePatientHistoryService = async (historyId, updates, user) => {
   if (!mongoose.Types.ObjectId.isValid(historyId)) {
    throw new BadRequestError('Invalid Patient History ID format');
  }

  const history = await PatientHistory.findById(historyId);
  if (!history) {
    throw new NotFoundError('Patient history not found');
  }

  const { role, _id } = user;

  if (role === 'patient' && history.user.toString() !== _id.toString()) {
    throw new ForbiddenError('Access denied: You can only update your own history.');
  }

  if (role === 'doctor') {
    throw new ForbiddenError('Access denied. Doctors must use the /doctor/:id route.');
  }

  delete updates.user;
  delete updates.appointments; 

  const updatedHistory = await PatientHistory.findByIdAndUpdate(
    historyId,
    updates, 
    { new: true, runValidators: true }
  ).populate('user', 'name email phone role hospital');

  return updatedHistory;
};


export const updatePatientHistoryByDoctorService = async (historyId, updates, user) => {
   if (!mongoose.Types.ObjectId.isValid(historyId)) {
    throw new BadRequestError('Invalid Patient History ID format');
  }

  const history = await PatientHistory.findById(historyId);
  if (!history) {
    throw new NotFoundError('Patient history not found');
  }

  const fieldsToMerge = ['currentMedications', 'allergies', 'labReports'];
  const updatePayload = { ...updates }; 

  fieldsToMerge.forEach(field => {
    if (updates[field] && Array.isArray(updates[field])) {

      const existingItems = history[field] || [];
      const newItems = updates[field].filter(newItem =>
          !existingItems.some(existingItem =>
              (typeof newItem === 'string' && existingItem === newItem) ||
              (typeof newItem === 'object' && existingItem.name === newItem.name) 
          )
      );
      updatePayload[field] = [...existingItems, ...newItems];
    }
  });

  delete updatePayload.user;
  delete updatePayload.appointments;

  const updatedHistory = await PatientHistory.findByIdAndUpdate(
    historyId,
    { $set: updatePayload }, 
    { new: true, runValidators: true }
  ).populate('user', 'name email phone role hospital');

  return updatedHistory;
};


export const deletePatientHistoryService = async (historyId, user) => {
   if (!mongoose.Types.ObjectId.isValid(historyId)) {
    throw new BadRequestError('Invalid Patient History ID format');
  }

  const history = await PatientHistory.findByIdAndDelete(historyId);
  if (!history) {
    throw new NotFoundError('Patient history not found');
  }

  await User.findByIdAndUpdate(history.user, { $unset: { patientHistory: "" } }); // Use $unset

  return { message: 'Patient history deleted' };
};