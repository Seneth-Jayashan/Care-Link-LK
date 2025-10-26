import request from 'supertest';
import app from '../app.js';
import User from '../models/user.js';
import Hospital from '../models/Hospital.js';
import DoctorDetails from '../models/DoctorDetails.js';
import PatientHistory from '../models/PatientHistory.js';
import mongoose from 'mongoose';
import { generateTestToken } from './helpers/tokenHelper.js'; // Import REAL token helper

// --- Mock New Dependencies ---
import Tesseract from "tesseract.js";
import stringSimilarity from "string-similarity";

jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}));

jest.mock('string-similarity', () => ({
  compareTwoStrings: jest.fn(),
}));

// --- Mock 'fs' ---
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: jest.fn(() => true),
    unlinkSync: jest.fn(),
    mkdirSync: jest.fn(),
  };
});

// --- DO NOT MOCK authMiddleware ---
// (All mockLogin/mockLogout helpers are removed)

describe('Hospital API Routes', () => {
  let admin, hospitalAdmin, doctor, patient;
  let adminToken, hospitalAdminToken, doctorToken, patientToken;
  let dbAdminUser, dbHospitalAdminUser, dbPatientUser, dbDoctorUser, testHospital, dbPatientHistory, dbDoctorDetails;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    Tesseract.recognize.mockReset();
    stringSimilarity.compareTwoStrings.mockReset();

    // Clear the database
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await PatientHistory.deleteMany({});
    await DoctorDetails.deleteMany({});

    // 1. Create Hospital
    testHospital = await Hospital.create({ name: 'Main Hospital', code: 'MH001', address: '123 Health St' });
    
    // 2. Create Users (with two-way binding)
    dbAdminUser = await User.create({ name: 'Admin User', email: 'admin@test.com', password: '123', role: 'admin' });
    
    dbHospitalAdminUser = await User.create({ 
      name: 'H-Admin User', 
      email: 'h_admin@test.com', 
      password: '123', 
      role: 'hospitaladmin',
      hospital: testHospital._id
    });
    
    patient = new User({ role: 'patient', name: 'Test Patient', email: 'patient@test.com', password: '123' });
    patientHistory = new PatientHistory({ user: patient._id, bloodGroup: 'O+' });
    patient.patientHistory = patientHistory._id;
    dbPatientUser = await patient.save();
    
    doctor = new User({ role: 'doctor', name: 'Test Doctor', email: 'doctor@test.com', password: '123', hospital: testHospital._id });
    doctorDetails = new DoctorDetails({ user: doctor._id, specialty: 'Cardiology', hospital: testHospital._id });
    doctor.doctorDetails = doctorDetails._id;
    dbDoctorUser = await doctor.save();
    
    // 3. Generate REAL tokens
    adminToken = generateTestToken(dbAdminUser);
    hospitalAdminToken = generateTestToken(dbHospitalAdminUser);
    doctorToken = generateTestToken(dbDoctorUser);
    patientToken = generateTestToken(dbPatientUser);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // --- POST /api/v1/hospitals/verify-license ---
  describe('POST /api/v1/hospitals/verify-license', () => {
    
    // We must simulate a file upload for the new test
    const verificationData = {
      hospitalName: "General Hospital"
    };
    const licenseFilePath = 'tests/mocks/fake-license.png';

    it('should be protected from unauthenticated users', async () => {
      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .field(verificationData)
        .attach('licenseDocument', Buffer.from('fake image data'), 'fake-license.png')
      expect(res.statusCode).toBe(401); // Real 'protect' middleware fails
    });

    it('should NOT allow a doctor to verify', async () => {
      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .set('Authorization', `Bearer ${doctorToken}`)
        .field(verificationData)
        .attach('licenseDocument', Buffer.from('fake image data'), 'fake-license.png')
      expect(res.statusCode).toBe(403); // Real 'authorize' middleware fails
    });

    it('should allow admin to verify', async () => {
      Tesseract.recognize.mockResolvedValue({ data: { text: "Name: General Hospital" } });
      stringSimilarity.compareTwoStrings.mockReturnValue(1.0);

      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .set('Authorization', `Bearer ${adminToken}`)
        .field(verificationData)
        .attach('licenseDocument', Buffer.from('fake image data'), 'fake-license.png')

      expect(res.statusCode).toBe(200);
      expect(res.body.verified).toBe(true);
    });

    // ... (Your other verify-license tests are fine, just add .set('Authorization', ...)) ...
  });

  // --- POST /api/v1/hospitals (Create Hospital) ---
  describe('POST /api/v1/hospitals', () => {
    const hospitalData = {
      name: "City General Hospital",
      code: "CGH001",
      address: "123 Main St",
      licenseDocument: "/uploads/license.pdf"
    };

    it('should not allow doctor to create a hospital', async () => {
      const res = await request(app)
        .post('/api/v1/hospitals')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(hospitalData);
      expect(res.statusCode).toBe(403); // Fails at middleware
    });

    it('should allow admin to create a hospital and link it to them', async () => {
      const res = await request(app)
        .post('/api/v1/hospitals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(hospitalData);
      
      expect(res.statusCode).toBe(201);
      
      // Test side-effect (handled by service)
      const userInDb = await User.findById(dbAdminUser._id);
      expect(userInDb.hospital).toEqual(new mongoose.Types.ObjectId(res.body._id));
    });
  });

  // --- GET /api/v1/hospitals ---
  describe('GET /api/v1/hospitals', () => {
    it('should not allow patient to get hospitals', async () => {
      const res = await request(app)
        .get('/api/v1/hospitals')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403); // Fails at middleware
    });
  });

  // --- DELETE /api/v1/hospitals/:id ---
  describe('DELETE /api/v1/hospitals/:id', () => {
    it('should allow admin to delete a hospital and trigger hook', async () => {
      // dbDoctorUser is linked to testHospital
      expect(dbDoctorUser.hospital).toEqual(testHospital._id);

      const res = await request(app)
        .delete(`/api/v1/hospitals/${testHospital._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);

      // Verify Mongoose Hook worked (the *real* test)
      const doctorInDb = await User.findById(dbDoctorUser._id);
      expect(doctorInDb.hospital).toBeNull();
    });
  });
});