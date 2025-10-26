import asyncHandler from 'express-async-handler';
import {
  createAppointmentService,
  getAppointmentsService,
  getAppointmentByIdService,
  updateAppointmentService,
  deleteAppointmentService,
} from '../services/appointmentService.js';
import { BadRequestError } from '../utils/errorResponse.js';

export const createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, hospital, appointmentDate, appointmentTime, reason } = req.body;
  if (!patient || !doctor || !hospital || !appointmentDate || !appointmentTime || !reason) {
    res.status(400); // Set 400 status
  throw new BadRequestError("Please provide all required fields for the appointment.");
  }
  
  const createdAppointment = await createAppointmentService(req.body, req.user);
  res.status(201).json(createdAppointment);
});

export const createAppointmentByDoctor = asyncHandler(async (req, res) => {
  const { patient, appointmentDate, appointmentTime, reason } = req.body;
  if (!patient || !appointmentDate || !appointmentTime || !reason) {
    res.status(400); // Set 400 status
    throw new BadRequestError("Please provide all required fields for the appointment.");
  }

  const createdAppointment = await createAppointmentService(req.body, req.user);
  res.status(201).json(createdAppointment);
});

export const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await getAppointmentsService(req.user);
  res.json(appointments);
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await getAppointmentByIdService(req.params.id, req.user);
  res.json(appointment);
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const updatedAppointment = await updateAppointmentService(req.params.id, req.body, req.user);
  res.json(updatedAppointment);
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const result = await deleteAppointmentService(req.params.id);
  res.json(result);
});