// tests/auth.routes.test.js
const request = require('supertest');
const app = require('../app.js').default;
const User = require('../models/user.js').default;
const mongoose = require('mongoose');

// --- Mock Auth Middleware ---
// This is necessary to test protected routes like /logout
const authMiddleware = require('../middlewares/authMiddleware.js');
jest.mock('../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => next()), // Default: pass through
  authorize: jest.fn(() => (req, res, next) => next()),
}));

// --- Helper Function to Simulate Login ---
const mockLogin = (user) => {
  authMiddleware.protect.mockImplementation((req, res, next) => {
    req.user = user;
    next();
  });
};

// --- Helper Function to Simulate Logout ---
const mockLogout = () => {
  authMiddleware.protect.mockImplementation((req, res, next) => {
    res.status(401).json({ message: 'Not authenticated' });
  });
};

// --- Test Suite ---
describe('Auth API Routes (/api/v1/auth)', () => {
  let testUser;

  // Before each test, clear mocks and seed a user
  beforeEach(async () => {
    jest.clearAllMocks();

    // We create an 'admin' user for simple login tests
    // as it doesn't have complex dependencies
    testUser = await User.create({
      name: 'Test User',
      email: 'login@example.com',
      password: 'password123', // The 'pre-save' hook will hash this
      role: 'admin',
    });
  });

  // --- POST /api/v1/auth/login ---
  describe('POST /api/v1/auth/login', () => {
    it('should log in a user with correct credentials and return a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      // Assuming your controller returns 200, user data, and a token
      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('should reject login with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      // Assuming your controller returns 401 for bad credentials
      expect(res.statusCode).toBe(401);
    });

    it('should reject login with a non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'password123',
        });

      // Assuming your controller returns 401 for user not found
      expect(res.statusCode).toBe(401);
    });
  });

  // --- POST /api/v1/auth/login/QR ---
  describe('POST /api/v1/auth/login/QR', () => {
    it('should log in a user with a valid QR identifier (e.g., userId)', async () => {
      // This test assumes 'loginQR' accepts a 'userId' in the body
      const res = await request(app)
        .post('/api/v1/auth/login/QR')
        .send({
          userId: testUser._id,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('should reject QR login with a non-existent userId', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/v1/auth/login/QR')
        .send({
          userId: randomId,
        });

      // Assuming your controller returns 401 or 404
      expect(res.statusCode).toBe(401);
    });
  });

  // --- POST /api/v1/auth/logout ---
  describe('POST /api/v1/auth/logout', () => {
    it('should be protected and return 401 if no user is logged in', async () => {
      // Simulate being logged out
      mockLogout();

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send();

      expect(res.statusCode).toBe(401);
      expect(authMiddleware.protect).toHaveBeenCalled();
    });

    it('should log out an authenticated user successfully', async () => {
      // Simulate being logged in
      mockLogin(testUser);

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send();

      // Assuming your controller returns 200 and a success message
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
      expect(authMiddleware.protect).toHaveBeenCalled();
    });
  });
});