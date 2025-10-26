import request from 'supertest';
import app from '../app.js';
import User from '../models/user.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import Hospital from '../models/Hospital.js';
import mongoose from 'mongoose';
import { generateTestToken } from './helpers/tokenHelper.js'; // Import REAL token helper

// --- DO NOT MOCK authMiddleware ---

describe('Patient History API Routes (/api/v1/patientHistories)', () => {
  // Define users and tokens needed for tests
  let adminUser, hospitalAdminUser, doctorUser, patient1User, patient2User;
  let adminToken, hospitalAdminToken, doctorToken, patient1Token, patient2Token;
  let history1, history2; // Store history documents
  let doc1Details;
  let testHospital;

  beforeEach(async () => {
    jest.resetAllMocks(); // For non-auth mocks if any

    // Clear relevant database collections
    await User.deleteMany({});
    await PatientHistory.deleteMany({});
    await DoctorDetails.deleteMany({});
    await Hospital.deleteMany({});

    // 1. Create Hospital
    testHospital = await Hospital.create({ name: 'Test Hospital', code: 'TH001' });

    // 2. Create Real DB Users for Authentication and Data
    adminUser = await User.create({ name: 'Admin', email: 'admin_ph@test.com', role: 'admin', password: '123' });
    hospitalAdminUser = await User.create({ name: 'HAdmin PH', email: 'hadmin_ph@test.com', role: 'hospitaladmin', password: '123', hospital: testHospital._id });

    // Doctor User
    doctorUser = new User({ name: 'Doctor PH', email: 'doc_ph@test.com', role: 'doctor', password: '123', hospital: testHospital._id });
    doc1Details = new DoctorDetails({ user: doctorUser._id, specialty: 'Testing' });
    doctorUser.doctorDetails = doc1Details._id;
    await doc1Details.save();
    await doctorUser.save();

    // Patient 1 User and History
    patient1User = new User({ name: 'Patient PH One', email: 'p1_ph@test.com', role: 'patient', password: '123' });
    history1 = new PatientHistory({ user: patient1User._id, bloodGroup: 'A+', allergies: ['Pollen'] });
    patient1User.patientHistory = history1._id;
    await history1.save();
    await patient1User.save();

    // Patient 2 User and History
    patient2User = new User({ name: 'Patient PH Two', email: 'p2_ph@test.com', role: 'patient', password: '123' });
    history2 = new PatientHistory({ user: patient2User._id, bloodGroup: 'B-' });
    patient2User.patientHistory = history2._id;
    await history2.save();
    await patient2User.save();

    // 3. Generate REAL Tokens
    adminToken = generateTestToken(adminUser);
    hospitalAdminToken = generateTestToken(hospitalAdminUser);
    doctorToken = generateTestToken(doctorUser);
    patient1Token = generateTestToken(patient1User);
    patient2Token = generateTestToken(patient2User);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });


  // --- GET / (getAllPatientHistories) ---
  describe('GET /api/v1/patientHistories', () => {
    it('should be protected from unauthenticated users', async () => {
      const res = await request(app).get('/api/v1/patientHistories');
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to get all histories', async () => {
      const res = await request(app)
        .get('/api/v1/patientHistories')
        .set('Authorization', `Bearer ${patient1Token}`);
      expect(res.statusCode).toBe(403); // Test authorize middleware
    });

    it('should allow admin to get all histories', async () => {
      const res = await request(app)
        .get('/api/v1/patientHistories')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2); // history1, history2
    });

     it('should allow doctor to get all histories', async () => {
      const res = await request(app)
        .get('/api/v1/patientHistories')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  // --- GET /:id (getPatientHistoryById) ---
  describe('GET /api/v1/patientHistories/:id', () => {
    it('should allow admin to get any history by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.bloodGroup).toBe('A+');
    });

    it('should allow patient to view their *own* history', async () => {
      const res = await request(app)
        .get(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${patient1Token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user._id).toBe(patient1User._id.toString());
    });

    it('should NOT allow a patient to view *another* patient\'s history', async () => {
      const res = await request(app)
        .get(`/api/v1/patientHistories/${history1._id}`) // Getting Patient One's history
        .set('Authorization', `Bearer ${patient2Token}`); // Logged in as Patient Two
      expect(res.statusCode).toBe(403); // Test service layer security check
      expect(res.body.message).toBe('Access denied: You can only view your own history.');
    });

     it('should return 404 for a non-existent history ID', async () => {
      const badId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/patientHistories/${badId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

   // --- GET /email/:email (getPatientByEmail) ---
  describe('GET /api/v1/patientHistories/email/:email', () => {
    it('should allow doctor to get history by email', async () => {
      const res = await request(app)
        .get(`/api/v1/patientHistories/email/${patient1User.email}`)
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.bloodGroup).toBe('A+'); // Check response structure
    });

     it('should return 404 for non-existent email', async () => {
      const res = await request(app)
        .get('/api/v1/patientHistories/email/bad@email.com')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found with that email or is not a patient');
    });

     it('should not allow patient to get history by email', async () => {
      const res = await request(app)
        .get(`/api/v1/patientHistories/email/${patient2User.email}`)
        .set('Authorization', `Bearer ${patient1Token}`);
      expect(res.statusCode).toBe(403); // Fails middleware
    });
  });

  // --- POST /scan (getPatientByQRCode) ---
  describe('POST /api/v1/patientHistories/scan', () => {
    it('should allow doctor to get history by QR code (ID)', async () => {
      const res = await request(app)
        .post('/api/v1/patientHistories/scan')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ patientHistoryId: history1._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.user._id).toBe(patient1User._id.toString());
    });

     it('should not allow admin to use scan route', async () => {
      const res = await request(app)
        .post('/api/v1/patientHistories/scan')
        .set('Authorization', `Bearer ${adminToken}`) // Admin not allowed by route
        .send({ patientHistoryId: history1._id });
      expect(res.statusCode).toBe(403);
    });

     it('should return 400 if patientHistoryId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/patientHistories/scan')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('patientHistoryId is required');
    });

     it('should return 404 if patientHistoryId is not found', async () => {
      const badId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/v1/patientHistories/scan')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ patientHistoryId: badId });
      expect(res.statusCode).toBe(404);
    });
  });

  // --- PUT /:id (updatePatientHistory) ---
  describe('PUT /api/v1/patientHistories/:id', () => {
     it('should allow admin to update any history', async () => {
      const res = await request(app)
        .put(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bloodGroup: 'O-' });
      expect(res.statusCode).toBe(200);
      expect(res.body.bloodGroup).toBe('O-');
    });

     it('should allow patient to update their *own* history', async () => {
      const res = await request(app)
        .put(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${patient1Token}`)
        .send({ gender: 'Male' });
      expect(res.statusCode).toBe(200);
      expect(res.body.gender).toBe('Male');
    });

     it('should NOT allow patient to update *another* patient\'s history', async () => {
      const res = await request(app)
        .put(`/api/v1/patientHistories/${history1._id}`) // Updating Patient One
        .set('Authorization', `Bearer ${patient2Token}`) // Logged in as Patient Two
        .send({ bloodGroup: 'AB-' });
      expect(res.statusCode).toBe(403); // Test service security check
      expect(res.body.message).toBe('Access denied: You can only update your own history.');
    });

     it('should not allow doctor to use general update route', async () => {
      const res = await request(app)
        .put(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${doctorToken}`) // Doctor should use /doctor/:id
        .send({ bloodGroup: 'O-' });
      expect(res.statusCode).toBe(403); // Test service security check
      expect(res.body.message).toBe("Access denied: role 'doctor' is not permitted");
    });
  });

   // --- PUT /doctor/:id (updatePatientHistoryByDoctor) ---
  describe('PUT /api/v1/patientHistories/doctor/:id', () => {
    it('should allow doctor to update a history', async () => {
      const newAllergies = ['Pollen', 'Dust'];
      const res = await request(app)
        .put(`/api/v1/patientHistories/doctor/${history1._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ allergies: newAllergies, notes: 'Follow-up needed.' });

      expect(res.statusCode).toBe(200);
      expect(res.body.allergies).toEqual(newAllergies);
      expect(res.body.notes).toBe('Follow-up needed.');
    });

     it('should not allow patient to use doctor update route', async () => {
      const res = await request(app)
        .put(`/api/v1/patientHistories/doctor/${history1._id}`)
        .set('Authorization', `Bearer ${patient1Token}`) // Patient not allowed by route
        .send({ notes: 'Self update' });
      expect(res.statusCode).toBe(403);
    });
  });

  // --- DELETE /:id (deletePatientHistory) ---
  describe('DELETE /api/v1/patientHistories/:id', () => {
    it('should allow admin to delete a history', async () => {
      const res = await request(app)
        .delete(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Patient history deleted');
      
      const historyInDb = await PatientHistory.findById(history1._id);
      expect(historyInDb).toBeNull();
    });

     it('should not allow doctor to delete a history', async () => {
      const res = await request(app)
        .delete(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${doctorToken}`); // Not allowed by route
      expect(res.statusCode).toBe(403);
    });

     it('should not allow patient to delete a history', async () => {
      const res = await request(app)
        .delete(`/api/v1/patientHistories/${history1._id}`)
        .set('Authorization', `Bearer ${patient1Token}`); // Not allowed by route
      expect(res.statusCode).toBe(403);
    });
  });

});