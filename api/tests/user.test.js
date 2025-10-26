const request = require('supertest');
const app = require('../app.js').default; // Your main Express app
const User = require('../models/user.js').default;
const PatientHistory = require('../models/PatientHistory.js').default;
const DoctorDetails = require('../models/DoctorDetails.js').default;
const Hospital = require('../models/Hospital.js').default;
const mongoose = require('mongoose');
const { generateTestToken } = require('./helpers/tokenHelper.js'); // Import the helper

// We still mock 'fs' for file uploads/deletes
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs'); 
  return {
    ...originalFs,
    existsSync: jest.fn(() => true),
    unlinkSync: jest.fn(),
    mkdirSync: jest.fn(),
  };
});

describe('User API Routes', () => {
  let admin, hospitalAdmin, doctor, patient, testHospital;
  let adminToken, hospitalAdminToken, doctorToken, patientToken;
  let patientHistory, doctorDetails; // Hold references

  // 
  // THIS IS THE CORRECTED BLOCK
  //
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // --- 1. CREATE HOSPITAL ---
    testHospital = await new Hospital({ 
        name: 'Main Hospital', 
        code: 'MH001', 
        address: '123 Health St' 
    }).save();

    // --- 2. CREATE NON-DEPENDENT USERS (Admin, HospitalAdmin) ---
    admin = await new User({
      role: 'admin',
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123'
    }).save();

    hospitalAdmin = await new User({
      role: 'hospitaladmin',
      hospital: testHospital._id,
      name: 'Hospital Admin',
      email: 'h_admin@test.com',
      password: 'password123'
    }).save();

    // --- 3. CREATE PATIENT (with two-way binding) ---
    // Create patient in memory (Mongoose assigns an _id automatically)
    patient = new User({
        role: 'patient',
        name: 'Patient User',
        email: 'patient@test.com',
        password: 'password123',
        // patientHistory is NOT set yet
    });
    // Create history in memory, linking to patient's in-memory _id
    patientHistory = new PatientHistory({
        user: patient._id, // <-- This is the key
        bloodGroup: 'O+',
        // ... any other required PatientHistory fields
    });
    // Now assign the history's _id back to the patient
    patient.patientHistory = patientHistory._id;
    
    // Save both. They now satisfy each other's validation rules.
    await patient.save();
    await patientHistory.save();

    // --- 4. CREATE DOCTOR (with two-way binding) ---
    // Create doctor in memory
    doctor = new User({
        role: 'doctor',
        hospital: testHospital._id,
        name: 'Doctor User',
        email: 'doc@test.com',
        password: 'password123',
        // doctorDetails is NOT set yet
    });
    // Create details in memory, linking to doctor's in-memory _id
    doctorDetails = new DoctorDetails({
        user: doctor._id, // <-- This is the key
        specialty: 'Cardiology',
        hospital: testHospital._id,
        // ... any other required DoctorDetails fields
    });
    // Assign the details' _id back to the doctor
    doctor.doctorDetails = doctorDetails._id;
    
    // Save both
    await doctor.save();
    await doctorDetails.save();

    // --- 5. GENERATE TOKENS ---
    adminToken = generateTestToken(admin);
    hospitalAdminToken = generateTestToken(hospitalAdmin);
    doctorToken = generateTestToken(doctor);
    patientToken = generateTestToken(patient);
  });
  // 
  // END OF CORRECTED BLOCK
  //

  // Clean up database after tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

- describe('POST /api/v1/users (Create User)', () => {
    it('should be protected from unauthenticated users', async () => {
      const res = await request(app).post('/api/v1/users').send({});
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should not allow patient to create a user', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ name: 'Test', email: 'test@example.com', role: 'patient' });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('should allow admin to create a patient', async () => {
      const patientData = {
        name: 'New Patient',
        email: 'patient-new@example.com',
        password: 'password123',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        bloodGroup: 'A+', // Make sure all required fields are present
      };

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .field(patientData);

      expect(res.statusCode).toBe(201); // This test should now pass
      expect(res.body.message).toContain('Patient created');
      const userInDb = await User.findOne({ email: 'patient-new@example.com' });
      expect(userInDb).not.toBeNull();
      expect(userInDb.patientHistory).not.toBeNull();
    });
  });

  // --- GET /api/v1/users ---
  describe('GET /api/v1/users (Get All Users)', () => {
   it('should not allow patient to get all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should not allow doctor to get all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(4); // 4 users created in beforeEach
    });
  });
  
  // --- DELETE /api/v1/:id ---
  describe('DELETE /api/v1/:id (Delete User)', () => {
    it('should not allow patient to delete another user', async () => {
     const res = await request(app)
        .delete(`/api/v1/users/${admin._id}`)
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to delete a patient and trigger history cleanup', async () => {
      // Use the patient created in beforeEach
      expect(await User.findById(patient._id)).not.toBeNull();
      expect(await PatientHistory.findById(patientHistory._id)).not.toBeNull();

      const res = await request(app)
        .delete(`/api/v1/users/${patient._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');

      // Verify cascade delete (handled by Mongoose hook)
      expect(await User.findById(patient._id)).toBeNull();
      expect(await PatientHistory.findById(patientHistory._id)).toBeNull();
   });
  });
});