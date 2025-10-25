// tests/user.routes.test.js
const request = require('supertest');
const app = require('../app.js').default;
const User = require('../models/user.js').default;
const PatientHistory = require('../models/PatientHistory.js').default;
const DoctorDetails = require('../models/DoctorDetails.js').default;
const Hospital = require('../models/Hospital.js').default;
const mongoose = require('mongoose');

// --- Mock Middleware ---
/*
 * We mock the entire authMiddleware module.
 * This gives us full control over `protect` and `authorize`.
 * We can simulate a user being logged in by setting `req.user`.
 * We can simulate authorization by checking the role.
 * We can simulate being logged out by sending a 401.
 */
const authMiddleware = require('../middlewares/authMiddleware.js');

jest.mock('../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => next()), // Default: pass through
  authorize: jest.fn(() => (req, res, next) => next()), // Default: pass through
}));

// Replace the old fs mock with this one
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs'); // 1. Get the real 'fs' module
  return {
    ...originalFs, // 2. Keep all its original functions (fixes Tesseract)
    existsSync: jest.fn(() => true), // 3. Override only what you need
    unlinkSync: jest.fn(),           // 3. Override only what you need
    mkdirSync: jest.fn(),           // 4. Add mkdirSync to stop uploadRoutes from crashing
  };
});

// --- Helper Function to Simulate Login ---
const mockLogin = (user) => {
  // Mock 'protect' to attach the user to req.user
  authMiddleware.protect.mockImplementation((req, res, next) => {
    req.user = user;
    next();
  });

  // Mock 'authorize' to *actually* check roles
  authMiddleware.authorize.mockImplementation((...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      // Send 403 Forbidden if user role is not allowed
      res.status(403).json({ message: 'Not authorized' });
    }
  });
};

// Helper function to simulate being logged out
const mockLogout = () => {
  authMiddleware.protect.mockImplementation((req, res, next) => {
    // Send 401 Unauthorized if no token
    res.status(401).json({ message: 'Not authenticated' });
  });
};

// --- Test Suite ---

describe('User API Routes', () => {
  let admin, hospitalAdmin, doctor, patient, testHospital;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock hospital
    testHospital = new Hospital({ name: 'Main Hospital', code: 'MH001', address: '123 Health St' });
    await testHospital.save();

    // Create mock user objects. These are just for the `req.user` mock.
    // We use real mongoose ObjectIds so they can be used in DB queries.
    admin = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
    };
    hospitalAdmin = {
      _id: new mongoose.Types.ObjectId(),
      role: 'hospitaladmin',
      hospital: testHospital._id,
    };
    doctor = {
      _id: new mongoose.Types.ObjectId(),
      role: 'doctor',
      hospital: testHospital._id,
    };
    patient = {
      _id: new mongoose.Types.ObjectId(),
      role: 'patient',
    };
  });

  // --- POST /api/v1/users ---
  describe('POST /api/v1/users (Create User)', () => {
    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).post('/api/v1/users').send({});
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to create a user', async () => {
      mockLogin(patient);
      console.log('Logged in as patient:', patient);
      const res = await request(app).post('/api/v1/users').send({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
      });
      console.log('Logged in as patient data:', res.body);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to create a patient', async () => {
      mockLogin(admin);
      const patientData = {
        name: 'New Patient',
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        bloodGroup: 'A+',
        allergies: 'Peanuts,Dust', // Test comma-separated string
      };

      const res = await request(app)
        .post('/api/v1/users')
        .field(patientData); // Use .field for multipart/form-data

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toContain('Patient created');
      
      const userInDb = await User.findOne({ email: 'patient@example.com' });
      const historyInDb = await PatientHistory.findOne({ user: userInDb._id });
      
      expect(userInDb).not.toBeNull();
      expect(historyInDb).not.toBeNull();
      expect(historyInDb.bloodGroup).toBe('A+');
      expect(historyInDb.allergies).toEqual(['Peanuts', 'Dust']);
    });

    it('should allow hospital admin to create a doctor', async () => {
      mockLogin(hospitalAdmin);
      const doctorData = {
        name: 'New Doctor',
        email: 'doctor@example.com',
        password: 'password123',
        role: 'doctor',
        specialty: 'Cardiology',
        schedule: JSON.stringify([{ day: 'Monday', time: '9-5' }]),
      };

      const res = await request(app)
        .post('/api/v1/users')
        .field(doctorData);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toContain('Doctor created');

      const userInDb = await User.findOne({ email: 'doctor@example.com' });
      const detailsInDb = await DoctorDetails.findOne({ user: userInDb._id });
      
      expect(userInDb).not.toBeNull();
      expect(detailsInDb).not.toBeNull();
      expect(detailsInDb.specialty).toBe('Cardiology');
      expect(userInDb.hospital).toEqual(testHospital._id); // Check hospital was assigned
    });
  });

  // --- GET /api/v1/users ---
  describe('GET /api/v1/users (Get All Users)', () => {
    it('should not allow patient to get all users', async () => {
      mockLogin(patient);
      const res = await request(app).get('/api/v1/users');
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to get all users', async () => {
      mockLogin(admin);
      // Seed DB
      await User.create({ name: 'U1', email: 'u1@e.com', password: '123' });
      await User.create({ name: 'U2', email: 'u2@e.com', password: '123' });

      const res = await request(app).get('/api/v1/users');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should allow hospital admin to get only their hospital users', async () => {
      mockLogin(hospitalAdmin);
      // Seed DB
      await User.create({ name: 'Hospital User', email: 'u1@e.com', password: '123', hospital: testHospital._id });
      await User.create({ name: 'Other User', email: 'u2@e.com', password: '123' });

      const res = await request(app).get('/api/v1/users');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Hospital User');
    });
  });


  // --- GET /api/v1/:id ---
  describe('GET /api/v1/:id (Get User By ID)', () => {
    it('should allow patient to view a user profile', async () => {
        mockLogin(patient);
        const userToView = await User.create({ name: 'Doc', email: 'doc@e.com', password: '123' });

        const res = await request(app).get(`/api/v1/users/${userToView._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Doc');
    });

    it('should return 404 for a non-existent user', async () => {
        mockLogin(admin);
        const badId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/v1/users/${badId}`);
        expect(res.statusCode).toBe(404);
    });
  });

  // --- PUT /api/v1/:id ---
  describe('PUT /api/v1/:id (Update User)', () => {

    it('should allow admin to update a user', async () => {
        mockLogin(admin);
        const userToUpdate = await User.create({ name: 'Old Name', email: 'test@e.com', password: '123' });

        const res = await request(app)
            .put(`/api/v1/users/${userToUpdate._id}`)
            .field({ name: 'New Name', email: 'new@e.com' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('New Name');
        expect(res.body.email).toBe('new@e.com');

        const userInDb = await User.findById(userToUpdate._id);
        expect(userInDb.name).toBe('New Name');
    });
  });
  
  // --- DELETE /api/v1/:id ---
  describe('DELETE /api/v1/:id (Delete User)', () => {
    it('should not allow patient to delete a user', async () => {
        mockLogin(patient);
        const userToDelete = await User.create({ name: 'Test', email: 'test@e.com', password: '123' });
        
        const res = await request(app).delete(`/api/v1/users/${userToDelete._id}`);
        expect(res.statusCode).toBe(403);
    });

    it('should allow admin to delete a patient and their history', async () => {
        mockLogin(admin);
        // Seed a full patient
        const patientUser = new User({ name: 'To Delete', email: 'del@e.com', password: '123', role: 'patient' });
        const patientHistory = new PatientHistory({ user: patientUser._id, bloodGroup: 'B+' });
        patientUser.patientHistory = patientHistory._id;
        await patientUser.save();
        await patientHistory.save();

        // Check they exist
        expect(await User.findById(patientUser._id)).not.toBeNull();
        expect(await PatientHistory.findById(patientHistory._id)).not.toBeNull();

        // Perform delete
        const res = await request(app).delete(`/api/v1/users/${patientUser._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User deleted successfully');

        // Verify cascade delete
        expect(await User.findById(patientUser._id)).toBeNull();
        expect(await PatientHistory.findById(patientHistory._id)).toBeNull();
    });
  });
});