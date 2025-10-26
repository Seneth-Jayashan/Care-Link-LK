import request from 'supertest';
import app from '../app.js';
import User from '../models/user.js';
import Hospital from '../models/Hospital.js';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import DoctorDetails from '../models/DoctorDetails.js';
import PatientHistory from '../models/PatientHistory.js';
import mongoose from 'mongoose';
import { generateTestToken } from './helpers/tokenHelper.js'; // Import REAL token helper

// --- DO NOT MOCK authMiddleware ---

describe('Reports API Routes (/api/v1/reports)', () => {
  let adminUser, hospitalAdminUser, doctorUser, patientUser; // Actual DB users
  let adminToken, hospitalAdminToken, doctorToken, patientToken;
  let hospital1, hospital2;
  let doctor1, doctor2, patient1; // DB users for data seeding
  let doc1Details, doc2Details, patient1History;
  let appt1, appt2, appt3, appt4, appt5;
  let payment1, payment2, payment3, payment4, payment5;

  beforeEach(async () => {
    jest.resetAllMocks(); // Only resets mocks, not DB

    // Clear database collections
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Payment.deleteMany({});
    await Appointment.deleteMany({});
    await DoctorDetails.deleteMany({});
    await PatientHistory.deleteMany({});

    // === Create Mock Hospitals ===
    hospital1 = await Hospital.create({ name: 'Hospital One', code: 'H001', address: '1 Main St' });
    hospital2 = await Hospital.create({ name: 'Hospital Two', code: 'H002', address: '2 Second St' });

    // === Create Mock DB Users (for logging in AND data) ===
    adminUser = await User.create({ name: 'System Admin', role: 'admin', email: 'admin@test.com', password: '123' });
    hospitalAdminUser = await User.create({ name: 'Hospital Admin 1', role: 'hospitaladmin', hospital: hospital1._id, email: 'h_admin@test.com', password: '123' });

    // --- Create users with linked docs for data seeding ---
    doctor1 = new User({ _id: new mongoose.Types.ObjectId(), name: 'Dr. Alice', role: 'doctor', hospital: hospital1._id, email: 'd1@e.com', password: '123' });
    doc1Details = new DoctorDetails({ user: doctor1._id, specialty: 'Cardiology', hospital: hospital1._id });
    doctor1.doctorDetails = doc1Details._id;

    doctor2 = new User({ _id: new mongoose.Types.ObjectId(), name: 'Dr. Bob', role: 'doctor', hospital: hospital2._id, email: 'd2@e.com', password: '123' });
    doc2Details = new DoctorDetails({ user: doctor2._id, specialty: 'Neurology', hospital: hospital2._id });
    doctor2.doctorDetails = doc2Details._id;

    patient1 = new User({ _id: new mongoose.Types.ObjectId(), name: 'Patient Smith', role: 'patient', email: 'p1@e.com', password: '123' });
    patient1History = new PatientHistory({ user: patient1._id, bloodGroup: 'O+' });
    patient1.patientHistory = patient1History._id;

    // Save linked docs first
    await doc1Details.save();
    await doc2Details.save();
    await patient1History.save();
    // Save users
    await doctor1.save();
    await doctor2.save();
    await patient1.save();
    
    // Create simple doctor/patient users just for token generation if needed elsewhere
    doctorUser = await User.create({ name: 'Dr. Test', role: 'doctor', hospital: hospital1._id, email: 'doc_login@test.com', password: '123', doctorDetails: doc1Details._id }); // Link existing details
    patientUser = await User.create({ name: 'Patient Login', role: 'patient', email: 'patient_login@test.com', password: '123', patientHistory: patient1History._id }); // Link existing history


    // === Generate REAL Tokens ===
    adminToken = generateTestToken(adminUser);
    hospitalAdminToken = generateTestToken(hospitalAdminUser);
    doctorToken = generateTestToken(doctorUser); // Token for a generic doctor
    patientToken = generateTestToken(patientUser); // Token for a generic patient

    // === Create Appointments & Payments (using seeded user IDs) ===
    const date1 = new Date('2023-10-01T10:00:00.000Z');
    const date2 = new Date('2023-10-02T11:00:00.000Z');
    const date3 = new Date('2023-10-03T12:00:00.000Z');

    appt1 = await Appointment.create({ patient: patient1._id, doctor: doctor1._id, hospital: hospital1._id, appointmentDate: date1, appointmentTime: '10:00', status: 'completed', patientHistory: patient1History._id, doctorDetails: doc1Details._id, createdAt: date1, updatedAt: date1 });
    appt2 = await Appointment.create({ patient: patient1._id, doctor: doctor1._id, hospital: hospital1._id, appointmentDate: date2, appointmentTime: '11:00', status: 'completed', patientHistory: patient1History._id, doctorDetails: doc1Details._id, createdAt: date2, updatedAt: date2 });
    appt3 = await Appointment.create({ patient: patient1._id, doctor: doctor2._id, hospital: hospital1._id, appointmentDate: date2, appointmentTime: '11:00', status: 'completed', patientHistory: patient1History._id, doctorDetails: doc2Details._id, createdAt: date2, updatedAt: date2 }); // Doc 2 @ Hosp 1
    appt4 = await Appointment.create({ patient: patient1._id, doctor: doctor2._id, hospital: hospital2._id, appointmentDate: date1, appointmentTime: '10:00', status: 'completed', patientHistory: patient1History._id, doctorDetails: doc2Details._id, createdAt: date1, updatedAt: date1 });
    appt5 = await Appointment.create({ patient: patient1._id, doctor: doctor1._id, hospital: hospital1._id, appointmentDate: date3, appointmentTime: '12:00', status: 'pending', patientHistory: patient1History._id, doctorDetails: doc1Details._id, createdAt: date3, updatedAt: date3 });

    payment1 = await Payment.create({ patient: patient1._id, appointment: appt1._id, hospital: hospital1._id, doctor: doctor1._id, amount: 100, status: 'paid', paymentType: 'card', createdAt: date1 });
    payment2 = await Payment.create({ patient: patient1._id, appointment: appt2._id, hospital: hospital1._id, doctor: doctor1._id, amount: 150, status: 'paid', paymentType: 'cash', createdAt: date2 });
    payment3 = await Payment.create({ patient: patient1._id, appointment: appt3._id, hospital: hospital1._id, doctor: doctor2._id, amount: 200, status: 'paid', paymentType: 'card', createdAt: date2 }); // Payment for Doc 2 @ Hosp 1
    payment4 = await Payment.create({ patient: patient1._id, appointment: appt4._id, hospital: hospital2._id, doctor: doctor2._id, amount: 500, status: 'paid', paymentType: 'online', createdAt: date1 });
    payment5 = await Payment.create({ patient: patient1._id, appointment: appt5._id, hospital: hospital1._id, doctor: doctor1._id, amount: 1000, status: 'pending', paymentType: 'card', createdAt: date3 });
  });

   afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });


  // --- GET /api/v1/reports (Discoverability) ---
  describe('GET /api/v1/reports', () => {
    it('should be protected from unauthenticated users', async () => {
      // No token sent
      const res = await request(app).get('/api/v1/reports');
      expect(res.statusCode).toBe(401);
    });

    it('should allow admin to see report list', async () => {
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.reports).toBeInstanceOf(Array);
      expect(res.body.reports.length).toBe(2);
    });

     it('should allow hospitaladmin to see report list', async () => {
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${hospitalAdminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should NOT allow doctor to see report list', async () => {
        const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.statusCode).toBe(403); // Test real authorize middleware
    });
  });

  // --- GET /api/v1/reports/finance ---
  describe('GET /api/v1/reports/finance', () => {
    it('should be protected from unauthenticated users', async () => {
      const res = await request(app).get('/api/v1/reports/finance');
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to access', async () => {
      const res = await request(app)
        .get('/api/v1/reports/finance')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should not allow doctor to access', async () => {
        const res = await request(app)
        .get('/api/v1/reports/finance')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to get report for ALL hospitals (ignoring pending)', async () => {
      const res = await request(app)
        .get('/api/v1/reports/finance')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.overall[0].count).toBe(4); // p1, p2, p3, p4
      expect(res.body.overall[0].totalAmount).toBe(950);
    });

    it('should allow admin to filter by hospitalId', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/finance?hospitalId=${hospital1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.overall[0].count).toBe(3); // p1, p2, p3
      expect(res.body.overall[0].totalAmount).toBe(450);
    });

    it('should allow hospitaladmin to get report (defaults to their hospital)', async () => {
      const res = await request(app)
        .get('/api/v1/reports/finance')
        .set('Authorization', `Bearer ${hospitalAdminToken}`); // Belongs to hospital1
      
      expect(res.statusCode).toBe(200);
      expect(res.body.overall[0].count).toBe(3); // p1, p2, p3
      expect(res.body.overall[0].totalAmount).toBe(450);
    });

    it('should allow admin to filter by date range', async () => {
      const res = await request(app)
        .get('/api/v1/reports/finance?startDate=2023-10-01&endDate=2023-10-01')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.overall[0].count).toBe(2); // p1, p4
      expect(res.body.overall[0].totalAmount).toBe(600);
    });

    // ... (other finance tests like aggregate by doctor) ...
  });

  // --- GET /api/v1/reports/patient-visits ---
  describe('GET /api/v1/reports/patient-visits', () => {
     it('should allow admin to get report for ALL hospitals (completed only)', async () => {
        const res = await request(app)
            .get('/api/v1/reports/patient-visits')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.overall[0].count).toBe(4); // a1, a2, a3, a4
     });

     it('should allow hospitaladmin to get report (defaults to their hospital)', async () => {
      const res = await request(app)
        .get('/api/v1/reports/patient-visits')
        .set('Authorization', `Bearer ${hospitalAdminToken}`); // Belongs to hospital1
      
      expect(res.statusCode).toBe(200);
      expect(res.body.overall[0].count).toBe(3); // a1, a2, a3
    });

    // ... (other patient visit tests) ...
  });

  // --- GET /api/v1/reports/patient-visits/debug ---
  describe('GET /api/v1/reports/patient-visits/debug', () => {
    it('should allow admin to get debug info for a hospital', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/patient-visits/debug?hospitalId=${hospital1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      // All appointments for hospital1 (a1, a2, a3, a5)
      console.log('Body: ', res.body);

      // --- THIS IS THE FIX ---
      // Use the correct property name 'preFilterCount'
      expect(res.body.preFilterCount[0].count).toBe(4);
      // --- END FIX ---

      // Completed samples (a1, a2, a3)
      expect(res.body.completedSamples.length).toBe(3);
      // Non-completed samples (a5)
      expect(res.body.nonCompletedSamples.length).toBe(1);
    });

     // ... (other debug tests) ...
  });
});