import asyncHandler from 'express-async-handler';
import { loginWithEmailPassword, loginWithQR } from '../services/authService.js';
import { generateToken } from '../utils/tokenUtils.js';
import { formatAuthResponse } from '../utils/responseFormatter.js';


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginWithEmailPassword(email, password);

  const token = generateToken(user);

  res.json(formatAuthResponse(user, token));
});


export const loginQR = asyncHandler(async (req, res) => {
  const { email, userId } = req.body;

  // 1. Let the service handle validation
  const user = await loginWithQR(email, userId);

  // 2. Generate token
  const token = generateToken(user);

  // 3. Format and send response
  res.json(formatAuthResponse(user, token));
});


export const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

