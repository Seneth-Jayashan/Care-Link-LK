import jwt from 'jsonwebtoken';

// --- IMPORTANT ---
// Make sure your tests load your .env file (e.g., using `dotenv`)
// so that process.env.JWT_SECRET is available.
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generates a valid JWT for testing.
 * @param {object} user - The user object (must have _id)
 * @returns {string} A valid JWT.
 */
export const generateTestToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Set it in your .env file for tests.');
  }
  
  if (!user || !user._id) {
    throw new Error('Invalid user object passed to generateTestToken');
  }

  // This must match how you sign tokens in your *real* login controller.
  // Most common is signing an object with the user's ID.
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
};