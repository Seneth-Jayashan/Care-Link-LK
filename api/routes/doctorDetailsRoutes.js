import express from 'express';
import { getAllDoctorDetails, getDoctorDetailsById,getDoctorDetailsByUserId, updateDoctorDetails, deleteDoctorDetails } from '../controllers/doctorDetailsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin and hospital admin can update/delete doctors
router.put('/:id', protect, authorize('admin', 'hospitaladmin'), updateDoctorDetails);
router.delete('/:id', protect, authorize('admin', 'hospitaladmin'), deleteDoctorDetails);

// Viewing allowed for all authenticated users
router.get('/', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getAllDoctorDetails);
router.get('/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getDoctorDetailsById);

router.get('/user/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getDoctorDetailsByUserId);

export default router;
