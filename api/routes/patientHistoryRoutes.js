import express from 'express';
import {
  getAllPatientHistories,
  getPatientHistoryById,
  updatePatientHistory,
  deletePatientHistory,
  getPatientByQRCode,
  updatePatientHistoryByDoctor,
  getPatientByEmail
} from '../controllers/patientHistoryController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// =======================
// VIEW ROUTES
// =======================

// View all patient histories (admin, doctor, hospitaladmin)
router.get('/', protect, authorize('admin', 'doctor', 'hospitaladmin'), getAllPatientHistories);

// View single patient history by ID (admin, doctor, hospitaladmin, patient)
router.get('/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getPatientHistoryById);
router.get('/:email', protect, authorize('admin', 'hospitaladmin', 'doctor'), getPatientByEmail )
// QR Scan: doctor scans patient QR to fetch patient history
router.post('/scan', protect, authorize('doctor'), getPatientByQRCode);

// =======================
// UPDATE ROUTES
// =======================

// General update: admin or hospital admin
router.put('/:id', protect, authorize('admin', 'hospitaladmin', 'patient'), updatePatientHistory);

// Doctor-specific update after consultation (merges medications, allergies, labReports)
router.put('/doctor/:id', protect, authorize('doctor'), updatePatientHistoryByDoctor);

// =======================
// DELETE ROUTES
// =======================

// Delete patient history (admin only)
router.delete('/:id', protect, authorize('admin'), deletePatientHistory);

export default router;
