import request from 'supertest';
import app from '../app.js'; // Adjust this path if your app.js is elsewhere
import User from '../models/user.js';
import Hospital from '../models/Hospital.js';
import DoctorDetails from '../models/DoctorDetails.js';
import PatientHistory from '../models/PatientHistory.js';
import mongoose from 'mongoose';

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
// This robust mock is needed because app.js imports uploadRoutes.js,
// which calls fs.mkdirSync. This prevents the test suite from crashing.
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs'); // Get the real 'fs' module
  return {
    ...originalFs, // Keep all its original functions
    existsSync: jest.fn(() => true),
    unlinkSync: jest.fn(),
    mkdirSync: jest.fn(), // Mock mkdirSync to prevent errors
  };
});

// --- Mock Middleware (Copied from appointment.test.js) ---
import * as authMiddleware from '../middlewares/authMiddleware.js';

jest.mock('../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => next()), // Default: pass through
  authorize: jest.fn(() => (req, res, next) => next()), // Default: pass through
}));

// --- Helper Function to Simulate Login (Copied from appointment.test.js) ---
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

// Helper function to simulate being logged out (Copied from appointment.test.js)
const mockLogout = () => {
  authMiddleware.protect.mockImplementation((req, res, next) => {
    // Send 401 Unauthorized if no token
    res.status(401).json({ message: 'Not authenticated' });
  });
};

// --- Test Suite ---

describe('Hospital API Routes', () => {
  // --- Test Data Setup ---
  let admin, hospitalAdmin, doctor, patient;
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

    // 1. Create mock data in the database
    testHospital = await Hospital.create({ name: 'Main Hospital', code: 'MH001', address: '123 Health St' });
    
    // 2. Create Admin User
    dbAdminUser = await User.create({ name: 'Admin User', email: 'admin@test.com', password: '123', role: 'admin' });

    // 3. Create Hospital Admin User
    dbHospitalAdminUser = await User.create({ 
      name: 'H-Admin User', 
      email: 'h_admin@test.com', 
      password: '123', 
      role: 'hospitaladmin',
      hospital: testHospital._id // Link to their hospital
    });

    // 4. Create Patient (Copied from appointment.test.js)
    dbPatientUser = await User.create({ name: 'Test Patient', email: 'patient@test.com', password: '123', role: 'patient' });
    dbPatientHistory = await PatientHistory.create({ user: dbPatientUser._id, bloodGroup: 'O+' });
    
    // 5. Create Doctor (Copied from appointment.test.js)
    const doctorUserId = new mongoose.Types.ObjectId();
    dbDoctorDetails = await DoctorDetails.create({ 
      specialty: 'Cardiology',
      user: doctorUserId 
    });
    dbDoctorUser = await User.create({ 
      _id: doctorUserId,
      name: 'Test Doctor', 
      email: 'doctor@test.com', 
      password: '123', 
      role: 'doctor', 
      hospital: testHospital._id,
      doctorDetails: dbDoctorDetails._id 
    });
    
    // 6. Create mock user objects for `req.user` using REAL DB IDs
    // This is crucial for controllers that modify req.user's document
    admin = {
      _id: dbAdminUser._id,
      role: 'admin',
    };
    hospitalAdmin = {
      _id: dbHospitalAdminUser._id,
      role: 'hospitaladmin',
      hospital: testHospital._id, 
    };
    doctor = {
      _id: dbDoctorUser._id,
      role: 'doctor',
      hospital: testHospital._id,
    };
    patient = {
      _id: dbPatientUser._id,
      role: 'patient',
    };
  });


  // --- POST /api/v1/hospitals/verify-license ---
  describe('POST /api/v1/hospitals/verify-license', () => {

    const verificationData = {
      licensePath: "/fake/path/license.png",
      hospitalName: "General Hospital"
    };

    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .send(verificationData);
      expect(res.statusCode).toBe(401);
    });

    it('should allow any authenticated user to attempt verification (e.g., admin)', async () => {
      mockLogin(admin);
      Tesseract.recognize.mockResolvedValue({ data: { text: "Name: General Hospital" } });
      stringSimilarity.compareTwoStrings.mockReturnValue(1.0);

      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .send(verificationData);
      
      expect(res.statusCode).toBe(200); // Passes verification
    });

    it('should allow a doctor to attempt verification', async () => {
      mockLogin(doctor);
      Tesseract.recognize.mockResolvedValue({ data: { text: "Name: General Hospital" } });
      stringSimilarity.compareTwoStrings.mockReturnValue(1.0);

      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .send(verificationData);
      
      expect(res.statusCode).toBe(200);
    });

    it('should return 400 if licensePath is missing', async () => {
      mockLogin(admin);
      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .send({ hospitalName: "Test" });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("License path and Hospital Name are required");
    });
    
    it('should return 400 if Tesseract cannot find the name', async () => {
      mockLogin(admin);
      // Mock Tesseract to return text that doesn't match the regex
      Tesseract.recognize.mockResolvedValue({ data: { text: "This is a license document." } });
      
      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .send(verificationData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Could not read Hospital Name");
    });

    it('should return 400 if name similarity is too low', async () => {
      mockLogin(admin);
      const extractedName = "General Hospitel"; // A typo
      Tesseract.recognize.mockResolvedValue({ data: { text: `Name: ${extractedName}` } });
      stringSimilarity.compareTwoStrings.mockReturnValue(0.4); // Mock low score

      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .send(verificationData); // Sending "General Hospital"
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Name mismatch");
      expect(res.body.message).toContain(extractedName);
    });
    
    it('should return 200 (Simulated) if verification passes', async () => {
      mockLogin(patient); // Any authenticated user
      const extractedName = "General Hospital";
      
      Tesseract.recognize.mockResolvedValue({ data: { text: `Official License\nName: ${extractedName}\nDate: ...` } });
      stringSimilarity.compareTwoStrings.mockReturnValue(0.95); // High similarity

      const res = await request(app)
        .post('/api/v1/hospitals/verify-license')
        .send(verificationData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.message).toContain("License successfully verified (Simulated)");
    });
  });

  // --- POST /api/v1/hospitals (Create Hospital) ---
  describe('POST /api/v1/hospitals', () => {

    const hospitalData = {
      name: "City General Hospital",
      code: "CGH001",
      address: "123 Main St",
      licenseDocument: "/uploads/license.pdf"
    };

    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).post('/api/v1/hospitals').send(hospitalData);
      expect(res.statusCode).toBe(401);
    });
    
    it('should not allow doctor to create a hospital', async () => {
      mockLogin(doctor);
      const res = await request(app).post('/api/v1/hospitals').send(hospitalData);
      expect(res.statusCode).toBe(403);
    });
    
    it('should not allow patient to create a hospital', async () => {
      mockLogin(patient);
      const res = await request(app).post('/api/v1/hospitals').send(hospitalData);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to create a hospital and link it to them', async () => {
      mockLogin(admin); // admin is a real DB user
      const res = await request(app).post('/api/v1/hospitals').send(hospitalData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(hospitalData.name);
      
      // Check hospital in DB
      const hospitalInDb = await Hospital.findById(res.body._id);
      expect(hospitalInDb).not.toBeNull();
      expect(hospitalInDb.hospitalAdmins).toContainEqual(admin._id); // Check user is admin

      // Check user in DB (side effect)
      const userInDb = await User.findById(admin._id);
      expect(userInDb.hospital).toEqual(hospitalInDb._id); // Check user is linked
    });
    
    it('should allow hospitaladmin to create a hospital and link it to them', async () => {
      // Log in as a hospital admin who *doesn't* have a hospital yet
      const unlinkedHAdminUser = await User.create({ name: 'New H-Admin', email: 'new_h@test.com', password: '123', role: 'hospitaladmin' });
      const unlinkedHAdminMock = { _id: unlinkedHAdminUser._id, role: 'hospitaladmin' };
      
      mockLogin(unlinkedHAdminMock);
      const res = await request(app).post('/api/v1/hospitals').send(hospitalData);
      
      expect(res.statusCode).toBe(201);
      
      const hospitalInDb = await Hospital.findById(res.body._id);
      const userInDb = await User.findById(unlinkedHAdminUser._id);
      
      expect(hospitalInDb).not.toBeNull();
      expect(userInDb.hospital).toEqual(hospitalInDb._id); // Check side effect
      expect(hospitalInDb.hospitalAdmins).toContainEqual(unlinkedHAdminUser._id);
    });
  });

  // --- GET /api/v1/hospitals (Get All Hospitals) ---
  describe('GET /api/v1/hospitals', () => {

    beforeEach(async () => {
      // testHospital is already created in the main beforeEach
      await Hospital.create({ name: 'Hosp 2', code: 'H2' });
    });

    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).get('/api/v1/hospitals');
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to get hospitals', async () => {
      mockLogin(patient);
      const res = await request(app).get('/api/v1/hospitals');
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to get all hospitals', async () => {
      mockLogin(admin);
      const res = await request(app).get('/api/v1/hospitals');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe('Main Hospital');
    });

    it('should allow hospitaladmin to get all hospitals', async () => {
      mockLogin(hospitalAdmin);
      const res = await request(app).get('/api/v1/hospitals');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });
    
    it('should allow doctor to get all hospitals', async () => {
      mockLogin(doctor);
      const res = await request(app).get('/api/v1/hospitals');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  // --- GET /api/v1/hospitals/:id (Get Hospital By ID) ---
  describe('GET /api/v1/hospitals/:id', () => {
    // Uses testHospital created in main beforeEach

    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).get(`/api/v1/hospitals/${testHospital._id}`);
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to get hospital by ID', async () => {
      mockLogin(patient);
      const res = await request(app).get(`/api/v1/hospitals/${testHospital._id}`);
      expect(res.statusCode).toBe(403);
    });

    it('should allow doctor to get hospital by ID', async () => {
      mockLogin(doctor);
      const res = await request(app).get(`/api/v1/hospitals/${testHospital._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(testHospital.name);
    });
    
    it('should return 404 for a non-existent ID', async () => {
      mockLogin(admin);
      const badId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/hospitals/${badId}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // --- PUT /api/v1/hospitals/:id (Update Hospital) ---
  describe('PUT /api/v1/hospitals/:id', () => {
    // Uses testHospital created in main beforeEach

    const updateData = {
      name: "New Hospital Name",
      bedCapacity: 500
    };

    it('should not allow doctor to update a hospital', async () => {
      mockLogin(doctor);
      const res = await request(app)
        .put(`/api/v1/hospitals/${testHospital._id}`)
        .send(updateData);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to update a hospital', async () => {
      mockLogin(admin);
      const res = await request(app)
        .put(`/api/v1/hospitals/${testHospital._id}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.bedCapacity).toBe(updateData.bedCapacity);

      const hospitalInDb = await Hospital.findById(testHospital._id);
      expect(hospitalInDb.name).toBe(updateData.name);
    });
    
    it('should allow hospitaladmin to update a hospital', async () => {
      mockLogin(hospitalAdmin);
      const res = await request(app)
        .put(`/api/v1/hospitals/${testHospital._id}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updateData.name);
    });
  });

  // --- DELETE /api/v1/hospitals/:id (Delete Hospital) ---
  describe('DELETE /api/v1/hospitals/:id', () => {
    // Uses testHospital and dbHospitalAdminUser created in main beforeEach

    it('should not allow doctor to delete a hospital', async () => {
      mockLogin(doctor);
      const res = await request(app).delete(`/api/v1/hospitals/${testHospital._id}`);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to delete a hospital', async () => {
      mockLogin(admin); 
      const res = await request(app).delete(`/api/v1/hospitals/${testHospital._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Hospital deleted successfully');

      const hospitalInDb = await Hospital.findById(testHospital._id);
      expect(hospitalInDb).toBeNull();
    });

    it('should allow a linked hospitaladmin to delete their hospital and unlink them', async () => {
      mockLogin(hospitalAdmin); // Logged in as the admin linked to testHospital
      
      const res = await request(app).delete(`/api/v1/hospitals/${testHospital._id}`);
      
      expect(res.statusCode).toBe(200);

      // Verify hospital is gone
      const hospitalInDb = await Hospital.findById(testHospital._id);
      expect(hospitalInDb).toBeNull();
      
      // Verify user's hospital link is set to null (side effect)
      const userInDb = await User.findById(hospitalAdmin._id);
      expect(userInDb.hospital).toBeNull();
    });

    it('should return 404 for deleting a non-existent ID', async () => {
      mockLogin(admin);
      const badId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/v1/hospitals/${badId}`);
      expect(res.statusCode).toBe(404);
    });
  });

});