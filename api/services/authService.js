import User from '../models/user.js';
import bcrypt from 'bcryptjs';

/**
 * @param {string} email - User's email.
 * @param {string} password - User's plaintext password.
 * @returns {Promise<object>} The validated Mongoose user object.
 * @throws {Error} If credentials are invalid.
 */
export const loginWithEmailPassword = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

/**
 * @param {string} email - User's email from QR.
 * @param {string} userId - User's ID from QR.
 * @returns {Promise<object>} The validated Mongoose user object.
 * @throws {Error} If credentials are invalid or user mismatch.
 */
export const loginWithQR = async (email, userId) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user._id.toString() !== userId) {
    throw new Error('Access denied. QR data mismatch.');
  }

  return user;
};