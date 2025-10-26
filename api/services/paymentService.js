// services/paymentService.js
import mongoose from 'mongoose';
import Payment from '../models/Payment.js'; 
import Appointment from '../models/Appointment.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errorResponse.js'; 


export const createPaymentService = async (data, user) => {
  const { patient, appointment, amount, paymentType, status = 'pending', transactionId } = data;

  if (!patient || !appointment || !amount) {
    throw new BadRequestError('Patient ID, Appointment ID, and Amount are required.');
  }
  if (!mongoose.Types.ObjectId.isValid(appointment)) {
      throw new BadRequestError('Invalid Appointment ID format');
  }
   if (!mongoose.Types.ObjectId.isValid(patient)) {
      throw new BadRequestError('Invalid Patient ID format');
  }

  const appointmentExists = await Appointment.findById(appointment);
  if (!appointmentExists) {
    throw new NotFoundError(`Associated appointment not found with ID: ${appointment}`);
  }

  if (user.role === 'patient' && appointmentExists.patient.toString() !== user._id.toString()) {
      throw new ForbiddenError('Patients can only create payments for their own appointments.');
  }

  const payment = new Payment({
    patient: appointmentExists.patient, 
    appointment: appointmentExists._id,
    hospital: appointmentExists.hospital, 
    doctor: appointmentExists.doctor,     
    amount,
    paymentType,
    status, 
    transactionId,
  });

  const createdPayment = await payment.save();

  if (createdPayment.status === 'paid') {
      await Appointment.findByIdAndUpdate(appointmentExists._id, { paymentStatus: 'paid' });
       console.log(`Updated appointment ${appointmentExists._id} paymentStatus to paid.`);
  }

  await createdPayment.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name email' },
      { path: 'appointment', select: 'appointmentDate reason' }
  ]);

  return createdPayment;
};


export const getPaymentsService = async (user, queryParams) => {
  let query = {};
  const { startDate, endDate, hospitalId, doctorId, patientId, status } = queryParams;

  const { role, _id, hospital: userHospital } = user;

  if (role === 'patient') {
    query.patient = _id;
  } else if (role === 'doctor') {
    query.doctor = _id;
  } else if (role === 'hospitaladmin') {

    const targetHospital = hospitalId || userHospital;
    if (targetHospital) {
        query.hospital = targetHospital;
    } else {
        // Hospital admin not linked to a hospital and no filter provided - show nothing
        console.warn(`Hospital admin ${user._id} has no hospital and did not provide a filter.`);
        return []; // Return empty array
    }
  }

  if (role === 'admin' && hospitalId) query.hospital = hospitalId; // Allow admin to filter by hospital
  if (patientId) query.patient = patientId; 
  if (doctorId) query.doctor = doctorId;    
  if (status) query.status = status;         

   if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      try { const s = new Date(startDate); s.setHours(0, 0, 0, 0); query.createdAt.$gte = s; }
      catch { console.warn("Invalid start date format in payment query:", startDate); }
    }
    if (endDate) {
      try { const e = new Date(endDate); e.setHours(23, 59, 59, 999); query.createdAt.$lte = e; }
      catch { console.warn("Invalid end date format in payment query:", endDate); }
    }
    if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
  }


  return Payment.find(query)
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .populate('appointment', 'appointmentDate reason')
    .sort({ createdAt: -1 });
};


export const getPaymentByIdService = async (paymentId, user) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new BadRequestError('Invalid Payment ID format');
  }

  const payment = await Payment.findById(paymentId)
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .populate('appointment'); 

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }


  const { role, _id, hospital: userHospital } = user;
  const isPatient = payment.patient._id.toString() === _id.toString();
  const isDoctor = payment.doctor._id.toString() === _id.toString();
  const isHospitalAdmin = role === 'hospitaladmin' && userHospital && payment.hospital.toString() === userHospital.toString();

  if (role !== 'admin' && !isPatient && !isDoctor && !isHospitalAdmin) {
    throw new ForbiddenError('Not authorized to view this payment');
  }

  return payment;
};


export const updatePaymentService = async (paymentId, updates, user) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new BadRequestError('Invalid Payment ID format');
  }

   const allowedUpdates = ['status', 'paymentType', 'transactionId', 'notes']; 
   const finalUpdates = {};
   for (const key of allowedUpdates) {
       if (updates[key] !== undefined) {
           finalUpdates[key] = updates[key];
       }
   }

   if (Object.keys(finalUpdates).length === 0) {
       throw new BadRequestError("No valid fields provided for update.");
   }

  const updatedPayment = await Payment.findByIdAndUpdate(
    paymentId,
    { $set: finalUpdates }, 
    { new: true, runValidators: true }
  ).populate('patient', 'name email')
   .populate('doctor', 'name email')
   .populate('appointment', 'appointmentDate reason');

  if (!updatedPayment) {
    throw new NotFoundError('Payment not found');
  }

  if (finalUpdates.status && finalUpdates.status === 'paid' && updatedPayment.appointment) {
      await Appointment.findByIdAndUpdate(updatedPayment.appointment._id, { paymentStatus: 'paid' });
       console.log(`Updated appointment ${updatedPayment.appointment._id} paymentStatus to paid.`);
  } else if (finalUpdates.status && finalUpdates.status !== 'paid' && updatedPayment.appointment) {
       await Appointment.findByIdAndUpdate(updatedPayment.appointment._id, { paymentStatus: 'unpaid' });
        console.log(`Updated appointment ${updatedPayment.appointment._id} paymentStatus to unpaid.`);
  }


  return updatedPayment;
};


export const deletePaymentService = async (paymentId, user) => {
   if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new BadRequestError('Invalid Payment ID format');
  }

  const payment = await Payment.findByIdAndDelete(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

   if (payment.appointment) {
        await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: 'unpaid' });
         console.log(`Updated appointment ${payment.appointment} paymentStatus to unpaid after payment deletion.`);
   }

  return { message: 'Payment removed successfully' };
};