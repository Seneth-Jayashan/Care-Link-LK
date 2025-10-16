import express from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only admins can create/update/delete users
router.post('/', protect, authorize('admin', 'hospitaladmin' ), upload.single('profileImage'), createUser);
router.put('/:id', protect, authorize('admin'), upload.single('profileImage'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Any authenticated user can view
router.get('/', protect, authorize('admin', 'doctor', 'hospitaladmin'), getUsers);
router.get('/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getUserById);

export default router;
