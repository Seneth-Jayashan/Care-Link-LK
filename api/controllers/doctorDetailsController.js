// controllers/doctorDetailsController.js
import asyncHandler from 'express-async-handler';
import {
  getAllDoctorDetailsService,
  getDoctorDetailsByIdService,
  getDoctorDetailsByUserIdService,
  updateDoctorDetailsService,
  deleteDoctorDetailsService,
} from '../services/doctorDetailsService.js'; 

export const getAllDoctorDetails = asyncHandler(async (req, res) => {
  const doctors = await getAllDoctorDetailsService(req.user);
  res.status(200).json(doctors);
});

export const getDoctorDetailsById = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDetailsByIdService(req.params.id);
  res.json(doctor);
});

export const getDoctorDetailsByUserId = asyncHandler(async (req, res) => {
  const doctor = await getDoctorDetailsByUserIdService(req.params.id);
  res.json(doctor);
});

export const updateDoctorDetails = asyncHandler(async (req, res) => {
  const doctor = await updateDoctorDetailsService(req.params.id, req.body);
  res.json(doctor);
});

export const deleteDoctorDetails = asyncHandler(async (req, res) => {
  const result = await deleteDoctorDetailsService(req.params.id);
  res.json(result);
});