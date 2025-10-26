import asyncHandler from 'express-async-handler';
import {
  verifyLicenseService,
  createHospitalService,
  getHospitalsService,
  getHospitalByIdService,
  updateHospitalService,
  deleteHospitalService,
} from '../services/hospitalService.js';
import { BadRequestError } from '../utils/errorResponse.js';

export const verifyLicense = asyncHandler(async (req, res) => {
  const { hospitalName } = req.body;
  
  if (!req.file) {
    throw new BadRequestError("License document file is required.");
  }
  
  const licensePath = req.file.path;
  const result = await verifyLicenseService(licensePath, hospitalName);
  
  res.status(200).json(result);
});

export const createHospital = asyncHandler(async (req, res) => {
  const hospital = await createHospitalService(req.body, req.user);
  res.status(201).json(hospital);
});

export const getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await getHospitalsService();
  res.json(hospitals);
});

export const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await getHospitalByIdService(req.params.id);
  res.json(hospital);
});

export const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await updateHospitalService(req.params.id, req.body);
  res.json(hospital);
});

export const deleteHospital = asyncHandler(async (req, res) => {
  const result = await deleteHospitalService(req.params.id);
  res.json(result);
});