// controllers/patientHistoryController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import {
  getAllPatientHistoriesService,
  getPatientHistoryByIdService,
  getPatientByEmailService,
  getPatientByQRCodeService,
  updatePatientHistoryService,
  updatePatientHistoryByDoctorService,
  deletePatientHistoryService,
} from '../services/patientHistoryService.js'; 
import { BadRequestError } from '../utils/errorResponse.js'; 

export const getAllPatientHistories = asyncHandler(async (req, res) => {
  const histories = await getAllPatientHistoriesService(req.user);
  res.json(histories);
});

export const getPatientHistoryById = asyncHandler(async (req, res) => {
  const history = await getPatientHistoryByIdService(req.params.id, req.user);
  res.json(history);
});

export const getPatientByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  if (!email) {
      throw new BadRequestError('Email parameter is required');
  }
  const history = await getPatientByEmailService(email, req.user);
  res.status(200).json(history); // Return the history object directly
});

export const getPatientByQRCode = asyncHandler(async (req, res) => {
  const { patientHistoryId } = req.body;
  if (!patientHistoryId) {
    throw new BadRequestError('patientHistoryId is required');
  }

  const patientHistory = await getPatientByQRCodeService(patientHistoryId, req.user);
  res.json(patientHistory);
});

export const updatePatientHistory = asyncHandler(async (req, res) => {
  const updatedHistory = await updatePatientHistoryService(req.params.id, req.body, req.user);
  res.json(updatedHistory);
});

export const updatePatientHistoryByDoctor = asyncHandler(async (req, res) => {
  const updatedHistory = await updatePatientHistoryByDoctorService(req.params.id, req.body, req.user);
  res.json(updatedHistory);
});

export const deletePatientHistory = asyncHandler(async (req, res) => {
  const result = await deletePatientHistoryService(req.params.id, req.user);
  res.json(result);
});