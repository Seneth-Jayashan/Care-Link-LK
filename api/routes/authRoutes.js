import express from 'express';
import { loginUser, logoutUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

export default router;
