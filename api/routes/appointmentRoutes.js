import express from 'express';
import { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment, createAppointmentByDoctor } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only patients, doctors, hospitaladmin can create/update
router.post('/', protect, authorize('patient', 'doctor', 'hospitaladmin'), createAppointment);
router.put('/:id', protect, authorize('doctor', 'hospitaladmin', 'patient'), updateAppointment);
router.delete('/:id', protect, authorize('admin', 'hospitaladmin'), deleteAppointment);

// Viewing allowed for all authenticated roles
router.get('/', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getAppointments);
router.get('/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getAppointmentById);

router.post('/doctor', protect, authorize('doctor'), createAppointmentByDoctor);
export default router;
