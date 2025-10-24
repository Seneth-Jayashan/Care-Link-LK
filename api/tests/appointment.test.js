// tests/appointment.test.js
import request from 'supertest';
import app from '../app.js'; // Adjust this path if your app.js is elsewhere
import Appointment from '../models/Appointment.js';
import User from '../models/user.js'; // Assuming you have a User model
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import Hospital from '../models/Hospital.js';
import mongoose from 'mongoose';

// --- Mock Middleware ---
/*
 * We mock the entire authMiddleware module, just like in the user test.
 * This gives us full control over `protect` and `authorize`.
 */
import * as authMiddleware from '../middlewares/authMiddleware.js';

jest.mock('../middlewares/authMiddleware.js', () => ({
  protect: jest.fn((req, res, next) => next()), // Default: pass through
  authorize: jest.fn(() => (req, res, next) => next()), // Default: pass through
}));

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

describe('Appointment API Routes', () => {
  // --- Test Data Setup ---
  let admin, hospitalAdmin, doctor, patient;
  let dbPatientUser, dbDoctorUser, testHospital, dbPatientHistory, dbDoctorDetails;

  // THIS BLOCK IS THE FIX
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Clear the database
    await Appointment.deleteMany({});
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await PatientHistory.deleteMany({});
    await DoctorDetails.deleteMany({});

    // 1. Create mock data in the database
    testHospital = await Hospital.create({ name: 'Main Hospital', code: 'MH001', address: '123 Health St' });
    
    // 2. Create Patient (This part is fine)
    dbPatientUser = await User.create({ name: 'Test Patient', email: 'patient@test.com', password: '123', role: 'patient' });
    dbPatientHistory = await PatientHistory.create({ user: dbPatientUser._id, bloodGroup: 'O+' });
    
    // 3. Create Doctor (Corrected for Circular Dependency)
    
    // 3a. Generate a new, valid ObjectId for the doctor user *before* creation.
    const doctorUserId = new mongoose.Types.ObjectId();

    // 3b. Create the DoctorDetails first, passing the pre-generated userId
    //     This satisfies the DoctorDetails schema's `user` requirement.
    dbDoctorDetails = await DoctorDetails.create({ 
      specialty: 'Cardiology',
      user: doctorUserId 
    });
    
    // 3c. Create the Doctor User, explicitly using the pre-generated _id
    //     and linking the new dbDoctorDetails._id.
    //     This satisfies the User schema's `doctorDetails` requirement.
    dbDoctorUser = await User.create({ 
      _id: doctorUserId, // <-- Use the pre-generated ID
      name: 'Test Doctor', 
      email: 'doctor@test.com', 
      password: '123', 
      role: 'doctor', 
      hospital: testHospital._id,
      doctorDetails: dbDoctorDetails._id 
    });
    
    // Now both documents are created and linked, satisfying both validations.

    // 4. Create mock user objects for `req.user`
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
      _id: dbDoctorUser._id, // Use the real DB user's ID
      role: 'doctor',
      hospital: testHospital._id,
    };
    patient = {
      _id: dbPatientUser._id, // Use the real DB user's ID
      role: 'patient',
    };
  });

  // --- POST /api/v1/appointments ---
  describe('POST /api/v1/appointments (Create Appointment)', () => {
    let newAppointmentData;

    beforeEach(() => {
      // Define standard appointment data
      newAppointmentData = {
        patient: dbPatientUser._id,
        doctor: dbDoctorUser._id,
        hospital: testHospital._id,
        appointmentDate: '2025-12-01T00:00:00.000Z',
        appointmentTime: '10:00',
        reason: 'Checkup',
      };
    });

    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).post('/api/v1/appointments').send(newAppointmentData);
      expect(res.statusCode).toBe(401);
    });

    it('should allow a patient to create an appointment', async () => {
      mockLogin(patient);
      const res = await request(app).post('/api/v1/appointments').send(newAppointmentData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.patient).toBe(dbPatientUser._id.toString());
      expect(res.body.doctor).toBe(dbDoctorUser._id.toString());
      expect(res.body.patientHistory).toBe(dbPatientHistory._id.toString()); // Check if history was linked
      expect(res.body.status).toBe('pending');
    });

    it('should allow a doctor to create an appointment', async () => {
        mockLogin(doctor);
        const res = await request(app).post('/api/v1/appointments').send(newAppointmentData);
        expect(res.statusCode).toBe(201);
    });

    it('should allow a hospitaladmin to create an appointment', async () => {
        mockLogin(hospitalAdmin);
        const res = await request(app).post('/api/v1/appointments').send(newAppointmentData);
        expect(res.statusCode).toBe(201);
    });

    it('should NOT allow an admin to create an appointment (as per routes)', async () => {
        mockLogin(admin); // 'admin' is not in the authorize list for POST
        const res = await request(app).post('/api/v1/appointments').send(newAppointmentData);
        expect(res.statusCode).toBe(403);
    });

    it('should return 400 for missing required fields', async () => {
      mockLogin(patient);
      const { doctor, ...incompleteData } = newAppointmentData; // Remove doctor
      const res = await request(app).post('/api/v1/appointments').send(incompleteData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Please provide all required fields');
    });

    it('should create a new PatientHistory if one does not exist', async () => {
      // 1. Create a new patient with no history
      const newPatientUser = await User.create({ name: 'New Patient', email: 'new@test.com', password: '123', role: 'patient' });
      const newPatientMock = { _id: newPatientUser._id, role: 'patient' };
      
      // 2. Log in as this new patient
      mockLogin(newPatientMock);

      // 3. Create appointment data for them
      const apptData = { ...newAppointmentData, patient: newPatientUser._id };
      
      // 4. Make the request
      const res = await request(app).post('/api/v1/appointments').send(apptData);
      
      // 5. Check results
      expect(res.statusCode).toBe(201);

      // 6. Verify a new PatientHistory was created and linked
      const newHistory = await PatientHistory.findOne({ user: newPatientUser._id });
      expect(newHistory).not.toBeNull();
      expect(res.body.patientHistory).toBe(newHistory._id.toString());
    });
  });

  // --- GET /api/v1/appointments ---
  describe('GET /api/v1/appointments (Get All Appointments)', () => {
    let appt1, appt2, appt3;

    beforeEach(async () => {
      // Create some appointments to test filtering
      
      // Appt 1: Our main patient and doctor
      appt1 = await Appointment.create({
        patient: dbPatientUser._id,
        patientHistory: dbPatientHistory._id,
        doctor: dbDoctorUser._id,
        hospital: testHospital._id,
        appointmentDate: '2025-12-01',
        appointmentTime: '10:00',
        reason: 'Checkup',
      });

      // Appt 2: Same patient, different doctor (from another hospital)
      const otherHospital = await Hospital.create({ name: 'Other Hospital' , code: 'OH002', address: '456 Wellness'});
      const otherDoctorUserId = new mongoose.Types.ObjectId();
      const otherDoctorDetails = await DoctorDetails.create({specialty: 'Cardiology', user: otherDoctorUserId })
      const otherDoctor = await User.create({ name: 'Other Doc', email: 'otherdoc@e.com', password: '123', role: 'doctor', hospital: otherHospital._id , doctorDetails:otherDoctorDetails._id});
      appt2 = await Appointment.create({
        patient: dbPatientUser._id,
        patientHistory: dbPatientHistory._id,
        doctor: otherDoctor._id,
        hospital: otherHospital._id,
        appointmentDate: '2025-12-02',
        appointmentTime: '11:00',
        reason: 'Follow-up',
      });

      // Appt 3: Different patient, same doctor
      const otherPatient = await User.create({ name: 'Other Patient', email: 'otherpat@e.com', password: '123', role: 'patient' });
      const otherHistory = await PatientHistory.create({ user: otherPatient._id });
      appt3 = await Appointment.create({
        patient: otherPatient._id,
        patientHistory: otherHistory._id,
        doctor: dbDoctorUser._id,
        hospital: testHospital._id,
        appointmentDate: '2025-12-03',
        appointmentTime: '14:00',
        reason: 'Consultation',
      });
    });

    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).get('/api/v1/appointments');
      expect(res.statusCode).toBe(401);
    });

    it('should allow admin to get ALL appointments', async () => {
      mockLogin(admin);
      const res = await request(app).get('/api/v1/appointments');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3); // Admin sees all
    });

    it('should allow patient to get ONLY their own appointments', async () => {
      mockLogin(patient); // Logged in as dbPatientUser
      const res = await request(app).get('/api/v1/appointments');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2); // Sees appt1 and appt2
      expect(res.body[0].patient.name).toBe(dbPatientUser.name);
      expect(res.body[1].patient.name).toBe(dbPatientUser.name);
    });

    it('should allow doctor to get ONLY their own appointments', async () => {
      mockLogin(doctor); // Logged in as dbDoctorUser
      const res = await request(app).get('/api/v1/appointments');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2); // Sees appt1 and appt3
      expect(res.body[0].doctor.name).toBe(dbDoctorUser.name);
      expect(res.body[1].doctor.name).toBe(dbDoctorUser.name);
    });

    it('should allow hospitaladmin to get ONLY their hospital\'s appointments', async () => {
      mockLogin(hospitalAdmin); // Logged in as admin for testHospital
      const res = await request(app).get('/api/v1/appointments');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2); // Sees appt1 and appt3
      expect(res.body[0].hospital.name).toBe(testHospital.name);
      expect(res.body[1].hospital.name).toBe(testHospital.name);
    });
  });

  // --- GET /api/v1/appointments/:id ---
  describe('GET /api/v1/appointments/:id (Get Single Appointment)', () => {
    let appt1, apptForOtherPatient;

    beforeEach(async () => {
        // Appointment for our main test patient
        appt1 = await Appointment.create({
            patient: dbPatientUser._id,
            patientHistory: dbPatientHistory._id,
            doctor: dbDoctorUser._id,
            hospital: testHospital._id,
            appointmentDate: '2025-12-01',
            appointmentTime: '10:00',
            reason: 'Checkup',
        });

        // Appointment for a *different* patient
        const otherPatient = await User.create({ name: 'Other Patient', email: 'otherpat@e.com', password: '123', role: 'patient' });
        const otherHistory = await PatientHistory.create({ user: otherPatient._id });
        apptForOtherPatient = await Appointment.create({
            patient: otherPatient._id,
            patientHistory: otherHistory._id,
            doctor: dbDoctorUser._id,
            hospital: testHospital._id,
            appointmentDate: '2025-12-03',
            appointmentTime: '14:00',
            reason: 'Consultation',
        });
    });

    it('should allow patient to get their OWN appointment', async () => {
        mockLogin(patient);
        const res = await request(app).get(`/api/v1/appointments/${appt1._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.reason).toBe('Checkup');
    });

    it('should NOT allow patient to get ANOTHER patient\'s appointment', async () => {
        mockLogin(patient); // Logged in as dbPatientUser
        const res = await request(app).get(`/api/v1/appointments/${apptForOtherPatient._id}`);
        
        // This tests the security check inside getAppointmentById controller
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Not authorized to view this appointment');
    });

    it('should allow doctor to get an appointment they are assigned to', async () => {
        mockLogin(doctor);
        const res = await request(app).get(`/api/v1/appointments/${appt1._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.reason).toBe('Checkup');
    });

    it('should allow admin to get ANY appointment', async () => {
        mockLogin(admin);
        const res = await request(app).get(`/api/v1/appointments/${apptForOtherPatient._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.reason).toBe('Consultation');
    });

    it('should return 404 for a non-existent appointment', async () => {
        mockLogin(admin);
        const badId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/v1/appointments/${badId}`);
        expect(res.statusCode).toBe(404);
    });
  });

  // --- PUT /api/v1/appointments/:id ---
  describe('PUT /api/v1/appointments/:id (Update Appointment)', () => {
    let apptToUpdate;

    beforeEach(async () => {
        apptToUpdate = await Appointment.create({
            patient: dbPatientUser._id,
            patientHistory: dbPatientHistory._id,
            doctor: dbDoctorUser._id,
            hospital: testHospital._id,
            appointmentDate: '2025-12-01',
            appointmentTime: '10:00',
            reason: 'Checkup',
            status: 'pending'
        });
    });

    it('should allow patient to update their appointment (e.g., cancel)', async () => {
        mockLogin(patient);
        const res = await request(app)
            .put(`/api/v1/appointments/${apptToUpdate._id}`)
            .send({ status: 'cancelled' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('cancelled');
    });

    it('should allow doctor to update the appointment (e.g., complete)', async () => {
        mockLogin(doctor);
        const res = await request(app)
            .put(`/api/v1/appointments/${apptToUpdate._id}`)
            .send({ status: 'completed', notes: 'All clear.' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('completed');
        expect(res.body.notes).toBe('All clear.');
    });

    it('should NOT allow admin to update an appointment (as per routes)', async () => {
        mockLogin(admin); // 'admin' is not in the authorize list for PUT
        const res = await request(app)
            .put(`/api/v1/appointments/${apptToUpdate._id}`)
            .send({ status: 'confirmed' });
        
        expect(res.statusCode).toBe(403);
    });

    it('should return 404 for updating a non-existent appointment', async () => {
        mockLogin(patient);
        const badId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/v1/appointments/${badId}`)
            .send({ status: 'confirmed' });
        expect(res.statusCode).toBe(404);
    });
  });

  // --- DELETE /api/v1/appointments/:id ---
  describe('DELETE /api/v1/appointments/:id (Delete Appointment)', () => {
    let apptToDelete;

    beforeEach(async () => {
        apptToDelete = await Appointment.create({
            patient: dbPatientUser._id,
            patientHistory: dbPatientHistory._id,
            doctor: dbDoctorUser._id,
            hospital: testHospital._id,
            appointmentDate: '2025-12-01',
            appointmentTime: '10:00',
            reason: 'Checkup',
        });
    });

    it('should be protected from unauthenticated users', async () => {
        mockLogout();
        const res = await request(app).delete(`/api/v1/appointments/${apptToDelete._id}`);
        expect(res.statusCode).toBe(401);
    });

    it('should NOT allow patient to delete an appointment', async () => {
        mockLogin(patient); // 'patient' is not in authorize list
        const res = await request(app).delete(`/api/v1/appointments/${apptToDelete._id}`);
        expect(res.statusCode).toBe(403);
    });

    it('should NOT allow doctor to delete an appointment', async () => {
        mockLogin(doctor); // 'doctor' is not in authorize list
        const res = await request(app).delete(`/api/v1/appointments/${apptToDelete._id}`);
        expect(res.statusCode).toBe(403);
    });

    it('should allow admin to delete an appointment', async () => {
        mockLogin(admin);
        const res = await request(app).delete(`/api/v1/appointments/${apptToDelete._id}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Appointment removed successfully');

        const apptInDb = await Appointment.findById(apptToDelete._id);
        expect(apptInDb).toBeNull();
    });

    it('should allow hospitaladmin to delete an appointment', async () => {
        mockLogin(hospitalAdmin);
        const res = await request(app).delete(`/api/v1/appointments/${apptToDelete._id}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Appointment removed successfully');
    });

    it('should return 404 for deleting a non-existent appointment', async () => {
        mockLogin(admin);
        const badId = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/v1/appointments/${badId}`);
        expect(res.statusCode).toBe(404);
    });
  });
});