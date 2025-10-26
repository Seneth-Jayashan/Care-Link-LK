const request = require('supertest');
const app = require('../app.js').default;
const User = require('../models/user.js').default;
const mongoose = require('mongoose');
// Import the *real* token generator, just like your login controller
// (or use the test helper from our previous session)
const { generateTestToken } = require('./helpers/tokenHelper.js'); 

// --- DO NOT MOCK authMiddleware ---
// jest.mock('../middlewares/authMiddleware.js', ...); // DELETE THIS

// --- Test Suite ---
describe('Auth API Routes (/api/v1/auth)', () => {
  let testUser;

  beforeEach(async () => {
    jest.clearAllMocks(); // This is for other mocks like 'fs', still good.

    testUser = await User.create({
      name: 'Test User',
      email: 'login@example.com',
      password: 'password123', 
      role: 'admin',
    });
  });

  // --- POST /api/v1/auth/login ---
  describe('POST /api/v1/auth/login', () => {
    // ... all your login tests are perfectly fine ...
    // ... they don't use auth middleware, so they already work ...
    it('should log in a user with correct credentials...', async () => {
      // ... (no change needed)
    });
  });

  // --- POST /api/v1/auth/login/QR ---
  describe('POST /api/v1/auth/login/QR', () => {
    // ... all your loginQR tests are also fine ...
    it('should log in a user with a valid QR identifier...', async () => {
      // ... (no change needed)
    });
  });

  // --- POST /api/v1/auth/logout ---
  describe('POST /api/v1/auth/logout', () => {
   it('should be protected and return 401 if no user is logged in', async () => {
      // REMOVED: mockLogout();

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send();

      // Now we test the REAL middleware's response
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token');
   });

    it('should log out an authenticated user successfully', async () => {
      // REMOVED: mockLogin(testUser);
      
      // 1. Generate a REAL token
      const token = generateTestToken(testUser);

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`) // 2. Send the real token
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});