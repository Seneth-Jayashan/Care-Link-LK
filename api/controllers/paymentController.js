// controllers/paymentController.js
import asyncHandler from 'express-async-handler';
import {
  createPaymentService,
  getPaymentsService,
  getPaymentByIdService,
  updatePaymentService,
  deletePaymentService,
} from '../services/paymentService.js'; 
import { BadRequestError } from '../utils/errorResponse.js'; 

export const createPayment = asyncHandler(async (req, res) => {
  const { patient, appointment, amount } = req.body;
  if (!patient || !appointment || !amount) {
    throw new BadRequestError('Patient ID, Appointment ID, and Amount are required.');
  }

  const createdPayment = await createPaymentService(req.body, req.user);
  res.status(201).json(createdPayment);
});

export const getPayments = asyncHandler(async (req, res) => {
  const payments = await getPaymentsService(req.user, req.query);
  res.json(payments);
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await getPaymentByIdService(req.params.id, req.user);
  res.json(payment);
});

export const updatePayment = asyncHandler(async (req, res) => {
  const updatedPayment = await updatePaymentService(req.params.id, req.body, req.user);
  res.json(updatedPayment);
});

export const deletePayment = asyncHandler(async (req, res) => {
  const result = await deletePaymentService(req.params.id, req.user);
  res.json(result);
});