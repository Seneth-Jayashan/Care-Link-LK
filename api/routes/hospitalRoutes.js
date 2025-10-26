import express from 'express';
import {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  verifyLicense,
} from '../controllers/hospitalController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'; // Assuming you have an upload for the license

const router = express.Router();

// Admin / Hospital Admin routes
router.post('/', protect, authorize('admin', 'hospitaladmin'), createHospital);
router.put('/:id', protect, authorize('admin', 'hospitaladmin'), updateHospital);
router.delete('/:id', protect, authorize('admin','hospitaladmin'), deleteHospital);

// License verification, also for admins
router.post(
  '/verify-license',
  protect,
  authorize('admin', 'hospitaladmin'),
  upload.single('licenseDocument'), 
  verifyLicense
);

// Any authenticated user (admin, hospitaladmin, doctor) can view
router.get('/', protect, authorize('admin', 'hospitaladmin', 'doctor'), getHospitals);
router.get('/:id', protect, authorize('admin', 'hospitaladmin', 'doctor'), getHospitalById);

export default router;