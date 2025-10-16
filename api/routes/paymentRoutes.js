import express from 'express';
import { createPayment, getPayments, getPaymentById, updatePayment, deletePayment } from '../controllers/paymentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only admin or hospital admin can create/update/delete payments
router.post('/', protect, authorize('admin', 'hospitaladmin', 'patient'), createPayment);
router.put('/:id', protect, authorize('admin', 'hospitaladmin'), updatePayment);
router.delete('/:id', protect, authorize('admin', 'hospitaladmin'), deletePayment);

// Viewing allowed for all authenticated roles
router.get('/', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getPayments);
router.get('/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getPaymentById);

export default router;
