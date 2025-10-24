import express from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser, getLoggedUser } from '../controllers/userController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public or authenticated user routes
router.get('/me', protect, getLoggedUser);
router.get('/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getUserById);

// Admin / hospital admin routes
router.get('/', protect, authorize('admin', 'doctor', 'hospitaladmin'), getUsers);
router.post('/', authorize('admin', 'hospitaladmin'),protect, upload.single('profileImage'), createUser);
router.put('/:id', protect, authorize('admin', 'hospitaladmin'), upload.single('profileImage'), updateUser);
router.delete('/:id', protect, authorize('admin', 'hospitaladmin'), deleteUser);

export default router;
