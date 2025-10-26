import request from 'supertest';
import app from '../app.js';
import Appointment from '../models/Appointment.js';
import User from '../models/user.js';
import PatientHistory from '../models/PatientHistory.js';
import DoctorDetails from '../models/DoctorDetails.js';
import Hospital from '../models/Hospital.js';
import mongoose from 'mongoose';
import { generateTestToken } from './helpers/tokenHelper.js'; // Import your REAL token helper
import { createAppointmentService } from '../services/appointmentService.js'; // Import the service

// --- DO NOT MOCK authMiddleware ---

describe('Appointment API Routes', () => {
  let admin, hospitalAdmin, doctor, patient;
  let adminToken, hospitalAdminToken, doctorToken, patientToken;
  let dbPatientUser, dbDoctorUser, testHospital, dbPatientHistory, dbDoctorDetails;

  beforeEach(async () => {
    jest.clearAllMocks(); // For 'fs' or other mocks

    // Clear the database
    await Appointment.deleteMany({});
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await PatientHistory.deleteMany({});
    await DoctorDetails.deleteMany({});

    // 1. Create Hospital
    testHospital = await Hospital.create({ name: 'Main Hospital', code: 'MH001', address: '123 Health St' });
    
    // 2. Create Users (with two-way binding)
    patient = new User({ role: 'patient', name: 'Test Patient', email: 'patient@test.com', password: '123' });
    patientHistory = new PatientHistory({ user: patient._id, bloodGroup: 'O+' });
    patient.patientHistory = patientHistory._id;
    dbPatientUser = await patient.save();
    dbPatientHistory = await patientHistory.save();

    doctor = new User({ role: 'doctor', name: 'Test Doctor', email: 'doctor@test.com', password: '123', hospital: testHospital._id });
    doctorDetails = new DoctorDetails({ user: doctor._id, specialty: 'Cardiology', hospital: testHospital._id });
    doctor.doctorDetails = doctorDetails._id;
    dbDoctorUser = await doctor.save();
    dbDoctorDetails = await doctorDetails.save();

    admin = await User.create({ role: 'admin', name: 'Admin', email: 'admin@test.com', password: '123' });
    hospitalAdmin = await User.create({ role: 'hospitaladmin', name: 'H. Admin', email: 'h-admin@test.com', password: '123', hospital: testHospital._id });

    // 3. Generate REAL tokens
    adminToken = generateTestToken(admin);
    hospitalAdminToken = generateTestToken(hospitalAdmin);
    doctorToken = generateTestToken(dbDoctorUser);
    patientToken = generateTestToken(dbPatientUser);
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // --- POST /api/v1/appointments ---
  describe('POST /api/v1/appointments (Create Appointment)', () => {
    let newAppointmentData;

    beforeEach(() => {
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
      const res = await request(app).post('/api/v1/appointments').send(newAppointmentData);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should allow a patient to create an appointment (status pending)', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(newAppointmentData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.patient).toBe(dbPatientUser._id.toString());
      expect(res.body.status).toBe('pending');
    });

    it('should NOT allow an admin to create an appointment', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAppointmentData);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('should return 400 for missing required fields', async () => {
      const { doctor, ...incompleteData } = newAppointmentData; // Remove doctor
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(incompleteData);
      
      expect(res.statusCode).toBe(400); // This now works
      expect(res.body.message).toContain('Please provide all required fields');
    });
  });

  // --- POST /api/v1/appointments/doctor ---
  describe('POST /api/v1/appointments/doctor (Create by Doctor)', () => {
    it('should allow a doctor to create an appointment (status confirmed)', async () => {
      const appointmentByDoc = {
        patient: dbPatientUser._id,
        // Doctor and hospital are OMITTED, they come from req.user
        appointmentDate: '2025-12-01T00:00:00.000Z',
        appointmentTime: '10:00',
        reason: 'Follow-up',
      };

      const res = await request(app)
        .post('/api/v1/appointments/doctor')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(appointmentByDoc);

      expect(res.statusCode).toBe(201);
      expect(res.body.doctor).toBe(dbDoctorUser._id.toString());
      expect(res.body.hospital).toBe(testHospital._id.toString()); // Auto-assigned
      expect(res.body.status).toBe('confirmed'); // Doctor-created is confirmed
    });
  });

  // --- GET /api/v1/appointments/:id ---
  describe('GET /api/v1/appointments/:id (Get Single Appointment)', () => {
    let appt1, apptForOtherPatient;

    beforeEach(async () => {
      // Appointment 1: Belongs to our main test patient
      const appt1Data = {
        patient: dbPatientUser._id,
        doctor: dbDoctorUser._id,
        hospital: testHospital._id,
        appointmentDate: '2025-12-01T00:00:00.000Z',
        appointmentTime: '10:00',
        reason: 'Checkup',
      };
      // We use the service to seed data, passing the patient as the creator
      appt1 = await createAppointmentService(appt1Data, dbPatientUser);
      
      // Appointment 2: Belongs to a *different* patient
      const otherPatientUser = new User({ role: 'patient', name: 'Other Patient', email: 'other@test.com', password: '123' });
      const otherPatientHistory = new PatientHistory({ user: otherPatientUser._id, bloodGroup: 'A-' });
      otherPatientUser.patientHistory = otherPatientHistory._id;
      await otherPatientUser.save();
      await otherPatientHistory.save();

      const appt2Data = {
        patient: otherPatientUser._id,
        doctor: dbDoctorUser._id,
        hospital: testHospital._id,
        appointmentDate: '2025-12-10T00:00:00.000Z',
        appointmentTime: '14:00',
        reason: 'Second Opinion',
      };
      // We use the service to seed data, passing the admin as the creator
      apptForOtherPatient = await createAppointmentService(appt2Data, admin); 
    });

    it('should allow patient to get their OWN appointment', async () => {
      const res = await request(app)
        .get(`/api/v1/appointments/${appt1._id}`)
        .set('Authorization', `Bearer ${patientToken}`);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.reason).toBe('Checkup');
    });

    it('should NOT allow patient to get ANOTHER patient\'s appointment', async () => {
      const res = await request(app)
        .get(`/api/v1/appointments/${apptForOtherPatient._id}`)
        .set('Authorization', `Bearer ${patientToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Not authorized to view this appointment');
    });

    it('should allow doctor to get an appointment they are assigned to', async () => {
      const res = await request(app)
        .get(`/api/v1/appointments/${appt1._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);
            
      expect(res.statusCode).toBe(200);
      expect(res.body.reason).toBe('Checkup');
    });

    it('should allow admin to get ANY appointment', async () => {
      const res = await request(app)
        .get(`/api/v1/appointments/${apptForOtherPatient._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
            
      expect(res.statusCode).toBe(200);
      expect(res.body.reason).toBe('Second Opinion');
    });

    it('should return 404 for a non-existent appointment', async () => {
      const badId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/appointments/${badId}`)
        .set('Authorization', `Bearer ${adminToken}`);
            
      expect(res.statusCode).toBe(404);
    });
  });

  // --- DELETE /api/v1/appointments/:id ---
  describe('DELETE /api/v1/appointments/:id', () => {
    let apptToDelete;
    
    beforeEach(async () => {
       const appData = {
          patient: dbPatientUser._id,
          doctor: dbDoctorUser._id,
          hospital: testHospital._id,
          appointmentDate: '2025-12-01T00:00:00.000Z',
          appointmentTime: '10:00',
          reason: 'Checkup',
       };
       // Seed data using the service
       apptToDelete = await createAppointmentService(appData, hospitalAdmin);
    });

    it('should NOT allow patient to delete an appointment', async () => {
      const res = await request(app)
        .delete(`/api/v1/appointments/${apptToDelete._id}`)
        .set('Authorization', `Bearer ${patientToken}`);
            
      expect(res.statusCode).toBe(403);
    });
    
    it('should allow admin to delete an appointment and trigger hook', async () => {
      // Verify appointment is linked in history before delete
      let history = await PatientHistory.findById(dbPatientHistory._id);
      expect(history.appointments).toContainEqual(apptToDelete._id);
      
      const res = await request(app)
        .delete(`/api/v1/appointments/${apptToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
            
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Appointment removed successfully');

      // Verify the model hook worked
      history = await PatientHistory.findById(dbPatientHistory._id);
      expect(history.appointments).not.toContain(apptToDelete._id);
    });
  });
});