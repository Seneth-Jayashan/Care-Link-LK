// tests/patientHistory.test.js
const request = require('supertest');
const app = require('../app.js').default; // Assuming app.js exports default
const User = require('../models/user.js').default;
const PatientHistory = require('../models/PatientHistory.js').default;
const DoctorDetails = require('../models/DoctorDetails.js').default;
const Hospital = require('../models/Hospital.js').default;
const mongoose = require('mongoose');

// --- Mock Middleware ---
const authMiddleware = require('../middlewares/authMiddleware.js');

jest.mock('../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => next()),
  authorize: jest.fn(() => (req, res, next) => next()),
}));

// --- Helper Function to Simulate Login ---
const mockLogin = (user) => {
  authMiddleware.protect.mockImplementation((req, res, next) => {
    req.user = user;
    next();
  });

  authMiddleware.authorize.mockImplementation((...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  });
};

// Helper function to simulate being logged out
const mockLogout = () => {
  authMiddleware.protect.mockImplementation((req, res, next) => {
    res.status(401).json({ message: 'Not authenticated' });
  });
};

// --- Test Suite ---

// --- FIX: Corrected base path in describe block ---
describe('Patient History API Routes (/api/v1/patientHistories)', () => {
  let admin, hospitalAdmin;
  let doctorLogin, patient1Login, patient2Login;
  let doctor1, patient1, patient2;
  let history1, history2;
  let doc1Details;
  let testHospital;

  beforeEach(async () => {
    jest.resetAllMocks();

    // Clear database collections
    await User.deleteMany({});
    await PatientHistory.deleteMany({});
    await DoctorDetails.deleteMany({});
    await Hospital.deleteMany({});

    // Create a mock hospital
    testHospital = new Hospital({ name: 'Test Hospital' , code: 'TH001'});
    await testHospital.save();

    // === Create Mock Users (for logging in) ===
    admin = { _id: new mongoose.Types.ObjectId(), role: 'admin' };
    hospitalAdmin = { _id: new mongoose.Types.ObjectId(), role: 'hospitaladmin', hospital: testHospital._id };

    // === Create Real DB Users and Histories ===

    // Doctor 1
    doctor1 = new User({
      _id: new mongoose.Types.ObjectId(),
      name: 'Doctor One',
      email: 'd1@test.com',
      role: 'doctor',
      password: '123',
      hospital: testHospital._id
    });
    doc1Details = new DoctorDetails({ user: doctor1._id, specialty: 'Cardiology' });
    doctor1.doctorDetails = doc1Details._id;
    await doc1Details.save();
    await doctor1.save();
    doctorLogin = { ...doctor1.toObject() }; // Mock login user based on real doc

    // Patient 1
    patient1 = new User({
      _id: new mongoose.Types.ObjectId(),
      name: 'Patient One',
      email: 'p1@test.com',
      role: 'patient',
      password: '123'
    });
    history1 = new PatientHistory({ user: patient1._id, bloodGroup: 'A+', allergies: ['Peanuts'] });
    patient1.patientHistory = history1._id;
    await history1.save();
    await patient1.save();
    patient1Login = { ...patient1.toObject() }; // Mock login user

    // Patient 2
    patient2 = new User({
      _id: new mongoose.Types.ObjectId(),
      name: 'Patient Two',
      email: 'p2@test.com',
      role: 'patient',
      password: '123'
    });
    history2 = new PatientHistory({ user: patient2._id, bloodGroup: 'B+' });
    patient2.patientHistory = history2._id;
    await history2.save();
    await patient2.save();
    patient2Login = { ...patient2.toObject() }; // Mock login user
  });

  // --- GET / (getAllPatientHistories) ---
  // --- FIX: Corrected base path ---
  describe('GET /api/v1/patientHistories', () => {
    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      // --- FIX: Corrected base path ---
      const res = await request(app).get('/api/v1/patientHistories');
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to get all histories', async () => {
      mockLogin(patient1Login);
      // --- FIX: Corrected base path ---
      const res = await request(app).get('/api/v1/patientHistories');
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to get all histories', async () => {
      mockLogin(admin);
      // --- FIX: Corrected base path ---
      const res = await request(app).get('/api/v1/patientHistories');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should allow doctor to get all histories', async () => {
      mockLogin(doctorLogin);
      // --- FIX: Corrected base path ---
      const res = await request(app).get('/api/v1/patientHistories');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  // --- GET /:id (getPatientHistoryById) ---
  // --- FIX: Corrected base path ---
  describe('GET /api/v1/patientHistories/:id', () => {
    it('should allow admin to get any history by ID', async () => {
      mockLogin(admin);
      // --- FIX: Corrected base path ---
      const res = await request(app).get(`/api/v1/patientHistories/${history1._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.bloodGroup).toBe('A+');
    });

    it('should allow patient to view their *own* history', async () => {
      mockLogin(patient1Login);
      // --- FIX: Corrected base path ---
      const res = await request(app).get(`/api/v1/patientHistories/${history1._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe('Patient One');
    });

    // NOTE: This test will fail (200) until you add the security fix I recommended
    it('should NOT allow a patient to view *another* patient\'s history', async () => {
      mockLogin(patient2Login); // Logged in as Patient Two
      // --- FIX: Corrected base path ---
      const res = await request(app).get(`/api/v1/patientHistories/${history1._id}`); // Getting Patient One's history
      expect(res.statusCode).toBe(403); // <-- Expect 403, not 200
    });

    it('should return 404 for a non-existent history ID', async () => {
      mockLogin(admin);
      const badId = new mongoose.Types.ObjectId();
      // --- FIX: Corrected base path ---
      const res = await request(app).get(`/api/v1/patientHistories/${badId}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // --- GET /email/:email (getPatientByEmail) ---
  // --- FIX: Corrected base path ---
  describe('GET /api/v1/patientHistories/email/:email', () => {
    it('should allow doctor to get history by email', async () => {
      mockLogin(doctorLogin);
      // --- FIX: Corrected base path ---
      const res = await request(app).get(`/api/v1/patientHistories/email/${patient1.email}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.userHistory.bloodGroup).toBe('A+');
    });

    it('should return 404 for non-existent email', async () => {
      mockLogin(doctorLogin);
      // --- FIX: Corrected base path ---
      const res = await request(app).get('/api/v1/patientHistories/email/bad@email.com');
      // This test requires you to fix the 'josn' typo in your controller
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Patient not found');
    });

    it('should not allow patient to get history by email', async () => {
      mockLogin(patient1Login);
      // --- FIX: Corrected base path ---
      const res = await request(app).get(`/api/v1/patientHistories/email/${patient2.email}`);
      expect(res.statusCode).toBe(403);
    });
  });

  // --- POST /scan (getPatientByQRCode) ---
  // --- FIX: Corrected base path ---
  describe('POST /api/v1/patientHistories/scan', () => {
    it('should allow doctor to get history by QR code (ID)', async () => {
      mockLogin(doctorLogin);
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .post('/api/v1/patientHistories/scan')
        .send({ patientHistoryId: history1._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe('Patient One');
    });

    it('should not allow admin to use scan route', async () => {
      mockLogin(admin);
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .post('/api/v1/patientHistories/scan')
        .send({ patientHistoryId: history1._id });
      expect(res.statusCode).toBe(403);
    });

    it('should return 400 if patientHistoryId is missing', async () => {
      mockLogin(doctorLogin);
      // --- FIX: Corrected base path ---
      const res = await request(app).post('/api/v1/patientHistories/scan').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('patientHistoryId is required');
    });

    it('should return 404 if patientHistoryId is not found', async () => {
      mockLogin(doctorLogin);
      const badId = new mongoose.Types.ObjectId();
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .post('/api/v1/patientHistories/scan')
        .send({ patientHistoryId: badId });
      expect(res.statusCode).toBe(404);
    });
  });

  // --- PUT /:id (updatePatientHistory) ---
  // --- FIX: Corrected base path ---
  describe('PUT /api/v1/patientHistories/:id', () => {
    it('should allow admin to update any history', async () => {
      mockLogin(admin);
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .put(`/api/v1/patientHistories/${history1._id}`)
        .send({ bloodGroup: 'O-' });
      expect(res.statusCode).toBe(200);
      expect(res.body.bloodGroup).toBe('O-');
    });

    it('should allow patient to update their *own* history', async () => {
      mockLogin(patient1Login);
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .put(`/api/v1/patientHistories/${history1._id}`)
        .send({ gender: 'Male' });
      expect(res.statusCode).toBe(200);
      expect(res.body.gender).toBe('Male');
    });

    // NOTE: This test will fail (200) until you add the security fix I recommended
    it('should NOT allow patient to update *another* patient\'s history', async () => {
      mockLogin(patient2Login); // Logged in as Patient Two
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .put(`/api/v1/patientHistories/${history1._id}`) // Updating Patient One's history
        .send({ bloodGroup: 'AB-' });
      expect(res.statusCode).toBe(403); // <-- Expect 403, not 200
    });

    it('should not allow doctor to use general update route', async () => {
      mockLogin(doctorLogin);
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .put(`/api/v1/patientHistories/${history1._id}`)
        .send({ bloodGroup: 'O-' });
      expect(res.statusCode).toBe(403);
    });
  });

  // --- PUT /doctor/:id (updatePatientHistoryByDoctor) ---
  // --- FIX: Corrected base path ---
  describe('PUT /api/v1/patientHistories/doctor/:id', () => {
    it('should allow doctor to update a history', async () => {
      mockLogin(doctorLogin);
      const newAllergies = ['Peanuts', 'Dust'];
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .put(`/api/v1/patientHistories/doctor/${history1._id}`)
        .send({ allergies: newAllergies, notes: 'Patient needs follow-up.' });

      expect(res.statusCode).toBe(200);
      expect(res.body.allergies).toEqual(newAllergies);
      expect(res.body.notes).toBe('Patient needs follow-up.');
    });

    it('should not allow patient to use doctor update route', async () => {
      mockLogin(patient1Login);
      const res = await request(app)
        // --- FIX: Corrected base path ---
        .put(`/api/v1/patientHistories/doctor/${history1._id}`)
        .send({ notes: 'Self update' });
      expect(res.statusCode).toBe(403);
    });
  });

  // --- DELETE /:id (deletePatientHistory) ---
  // --- FIX: Corrected base path ---
  describe('DELETE /api/v1/patientHistories/:id', () => {
    it('should allow admin to delete a history', async () => {
      mockLogin(admin);
      // --- FIX: Corrected base path ---
      const res = await request(app).delete(`/api/v1/patientHistories/${history1._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Patient history deleted');
      
      const historyInDb = await PatientHistory.findById(history1._id);
      expect(historyInDb).toBeNull();
    });

    it('should not allow doctor to delete a history', async () => {
      mockLogin(doctorLogin);
      // --- FIX: Corrected base path ---
      const res = await request(app).delete(`/api/v1/patientHistories/${history1._id}`);
      expect(res.statusCode).toBe(403);
    });

    it('should not allow patient to delete a history', async () => {
      mockLogin(patient1Login);
      // --- FIX: Corrected base path ---
      const res = await request(app).delete(`/api/v1/patientHistories/${history1._id}`);
      expect(res.statusCode).toBe(403);
    });
  });
});