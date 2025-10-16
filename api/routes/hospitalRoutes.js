import express from 'express';
import {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} from '../controllers/hospitalController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin can create hospital
router.post('/', protect, authorize('admin', 'hospitaladmin'), createHospital);

// Any authenticated user (admin, hospitaladmin, doctor) can view
router.get('/', protect, authorize('admin', 'hospitaladmin', 'doctor'), getHospitals);
router.get('/:id', protect, authorize('admin', 'hospitaladmin', 'doctor'), getHospitalById);

// Admin can update or delete hospital
router.put('/:id', protect, authorize('admin', 'hospitaladmin'), updateHospital);
router.delete('/:id', protect, authorize('admin','hospitaladmin'), deleteHospital);

export default router;
