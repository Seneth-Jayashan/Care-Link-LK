import express from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser, getLoggedUser } from '../controllers/userController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', protect, authorize('admin', 'doctor', 'hospitaladmin'), getUsers);


// Only admins can create/update/delete users
router.post('/', protect, authorize('admin', 'hospitaladmin'), upload.single('profileImage'), createUser);
router.put('/:id', protect, authorize('admin', 'hospitaladmin'), upload.single('profileImage'), updateUser);

router.delete('/:id', protect, authorize('admin', 'hospitaladmin'), deleteUser);

router.get('/me', protect, getLoggedUser);

// Any authenticated user can view
router.get('/:id', protect, authorize('admin', 'doctor', 'hospitaladmin', 'patient'), getUserById);




export default router;
