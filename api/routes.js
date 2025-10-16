import express from 'express';
import userRoutes from './routes/userRoutes.js';
import patientHistoryRoutes from './routes/patientHistoryRoutes.js';
import doctorDetailsRoutes from './routes/doctorDetailsRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';

const router = express.Router();

// Mount all routes under /api
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patientHistories', patientHistoryRoutes);
router.use('/doctors', doctorDetailsRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/payments', paymentRoutes);

export default router;
