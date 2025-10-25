// tests/reports.routes.test.js
const request = require('supertest');
const app = require('../app.js').default; // Assuming app.js exports default
const User = require('../models/user.js').default;
const Hospital = require('../models/Hospital.js').default;
const Payment = require('../models/Payment.js').default;
const Appointment = require('../models/Appointment.js').default;
// --- Import models needed for setup ---
const DoctorDetails = require('../models/DoctorDetails.js').default;
const PatientHistory = require('../models/PatientHistory.js').default;
const mongoose = require('mongoose');

// --- Mock Middleware ---
/*
 * We mock the entire authMiddleware module.
 * This gives us full control over `protect` and `authorize`.
 */
const authMiddleware = require('../middlewares/authMiddleware.js');

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

describe('Reports API Routes (/api/v1/reports)', () => {
  let admin, hospitalAdmin, doctor, patient;
  let hospital1, hospital2;
  let doctor1, doctor2, patient1;
  let doc1Details, doc2Details, patient1History;
  let appt1, appt2, appt3, appt4, appt5;
  let payment1, payment2, payment3, payment4, payment5;

  beforeEach(async () => {
    // --- FIX 1: Use resetAllMocks for a cleaner state between tests ---
    jest.resetAllMocks();

    // Clear database collections
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Payment.deleteMany({});
    await Appointment.deleteMany({});
    // --- Clear related models ---
    await DoctorDetails.deleteMany({});
    await PatientHistory.deleteMany({});

    // === Create Mock Hospitals ===
    hospital1 = new Hospital({ name: 'Hospital One', code: 'H001', address: '1 Main St' });
    hospital2 = new Hospital({ name: 'Hospital Two', code: 'H002', address: '2 Second St' });
    await hospital1.save();
    await hospital2.save();

    // === Create Mock Users (for logging in) ===
    admin = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
      name: 'System Admin',
    };
    hospitalAdmin = {
      _id: new mongoose.Types.ObjectId(),
      role: 'hospitaladmin',
      hospital: hospital1._id, // Belongs to Hospital One
      name: 'Hospital Admin 1',
    };
    doctor = {
      _id: new mongoose.Types.ObjectId(),
      role: 'doctor',
      hospital: hospital1._id,
      name: 'Dr. Test',
    };
    patient = {
      _id: new mongoose.Types.ObjectId(),
      role: 'patient',
      name: 'Test Patient',
    };

    // === Create Mock DB Data (for querying) ===
    // --- Create users with their required linked documents ---

    // Doctor 1
    doctor1 = new User({ _id: new mongoose.Types.ObjectId(), name: 'Dr. Alice', role: 'doctor', hospital: hospital1._id, email: 'd1@e.com', password: '123' });
    doc1Details = new DoctorDetails({ user: doctor1._id, specialty: 'Cardiology' });
    doctor1.doctorDetails = doc1Details._id; // Link user to details

    // Doctor 2
    doctor2 = new User({ _id: new mongoose.Types.ObjectId(), name: 'Dr. Bob', role: 'doctor', hospital: hospital2._id, email: 'd2@e.com', password: '123' });
    doc2Details = new DoctorDetails({ user: doctor2._id, specialty: 'Neurology' });
    doctor2.doctorDetails = doc2Details._id; // Link user to details

    // Patient 1
    patient1 = new User({ _id: new mongoose.Types.ObjectId(), name: 'Patient Smith', role: 'patient', email: 'p1@e.com', password: '123' });
    patient1History = new PatientHistory({ user: patient1._id, bloodGroup: 'O+' });
    patient1.patientHistory = patient1History._id; // Link user to history

    // Save all
    await doc1Details.save();
    await doc2Details.save();
    await patient1History.save();
    await doctor1.save();
    await doctor2.save();
    await patient1.save();

    // === Create Mock Appointments ===
    // Dates for filtering
    const date1 = new Date('2023-10-01T10:00:00.000Z');
    const date2 = new Date('2023-10-02T11:00:00.000Z');
    const date3 = new Date('2023-10-03T12:00:00.000Z');

    // --- Use correct patientHistory ID ---
    // Hosp 1, Doc 1, Completed on Day 1
    appt1 = new Appointment({
      patient: patient1._id, doctor: doctor1._id, hospital: hospital1._id,
      appointmentDate: date1, appointmentTime: '10:00', status: 'completed',
      patientHistory: patient1History._id, // Use real history ID
      doctorDetails: doc1Details._id,
      createdAt: date1, updatedAt: date1,
    });
    // Hosp 1, Doc 1, Completed on Day 2
    appt2 = new Appointment({
      patient: patient1._id, doctor: doctor1._id, hospital: hospital1._id,
      appointmentDate: date2, appointmentTime: '11:00', status: 'completed',
      patientHistory: patient1History._id, // Use real history ID
      doctorDetails: doc1Details._id,
      createdAt: date2, updatedAt: date2,
    });
    // Hosp 1, Doc 2, Completed on Day 2
    appt3 = new Appointment({
      patient: patient1._id, doctor: doctor2._id, hospital: hospital1._id,
      appointmentDate: date2, appointmentTime: '11:00', status: 'completed',
      patientHistory: patient1History._id, // Use real history ID
      doctorDetails: doc2Details._id,
      createdAt: date2, updatedAt: date2,
    });
    // Hosp 2, Doc 2, Completed on Day 1
    appt4 = new Appointment({
      patient: patient1._id, doctor: doctor2._id, hospital: hospital2._id,
      appointmentDate: date1, appointmentTime: '10:00', status: 'completed',
      patientHistory: patient1History._id, // Use real history ID
      doctorDetails: doc2Details._id,
      createdAt: date1, updatedAt: date1,
    });
    // Hosp 1, Doc 1, Pending (should be ignored by visit report, but seen by debug)
    appt5 = new Appointment({
      patient: patient1._id, doctor: doctor1._id, hospital: hospital1._id,
      appointmentDate: date3, appointmentTime: '12:00', status: 'pending',
      patientHistory: patient1History._id, // Use real history ID
      doctorDetails: doc1Details._id,
      createdAt: date3, updatedAt: date3,
    });
    await Appointment.insertMany([appt1, appt2, appt3, appt4, appt5]);

    // === Create Mock Payments ===
    // Hosp 1, Doc 1, Paid, Day 1, 100
    payment1 = new Payment({
      patient: patient1._id, appointment: appt1._id, hospital: hospital1._id, doctor: doctor1._id,
      amount: 100, status: 'paid', paymentType: 'card', createdAt: date1,
    });
    // Hosp 1, Doc 1, Paid, Day 2, 150
    payment2 = new Payment({
      patient: patient1._id, appointment: appt2._id, hospital: hospital1._id, doctor: doctor1._id,
      amount: 150, status: 'paid', paymentType: 'cash', createdAt: date2,
    });
    // Hosp 1, Doc 2, Paid, Day 2, 200
    payment3 = new Payment({
      patient: patient1._id, appointment: appt3._id, hospital: hospital1._id, doctor: doctor2._id,
      amount: 200, status: 'paid', paymentType: 'card', createdAt: date2,
    });
    // Hosp 2, Doc 2, Paid, Day 1, 500
    payment4 = new Payment({
      patient: patient1._id, appointment: appt4._id, hospital: hospital2._id, doctor: doctor2._id,
      amount: 500, status: 'paid', paymentType: 'online', createdAt: date1,
    });
    // Hosp 1, Doc 1, Pending (should be ignored by finance report)
    payment5 = new Payment({
      patient: patient1._id, appointment: appt5._id, hospital: hospital1._id, doctor: doctor1._id,
      amount: 1000, status: 'pending', paymentType: 'card', createdAt: date3,
    });
    await Payment.insertMany([payment1, payment2, payment3, payment4, payment5]);
  });

  // --- GET /api/v1/reports (Discoverability) ---
  describe('GET /api/v1/reports', () => {
    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).get('/api/v1/reports');
      expect(res.statusCode).toBe(401);
    });

    it('should allow admin to see report list', async () => {
      mockLogin(admin);
      const res = await request(app).get('/api/v1/reports');
      expect(res.statusCode).toBe(200);
      expect(res.body.reports).toBeInstanceOf(Array);
      expect(res.body.reports.length).toBe(2);
      expect(res.body.reports[0].key).toBe('finance');
    });

    it('should allow hospitaladmin to see report list', async () => {
      mockLogin(hospitalAdmin);
      const res = await request(app).get('/api/v1/reports');
      expect(res.statusCode).toBe(200);
      expect(res.body.reports[1].key).toBe('patient-visits');
    });
  });

  // --- GET /api/v1/reports/finance ---
  describe('GET /api/v1/reports/finance', () => {
    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).get('/api/v1/reports/finance');
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to access', async () => {
      mockLogin(patient);
      const res = await request(app).get('/api/v1/reports/finance');
      expect(res.statusCode).toBe(403);
    });

    it('should not allow doctor to access', async () => {
      mockLogin(doctor);
      const res = await request(app).get('/api/v1/reports/finance');
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to get report for ALL hospitals (ignoring pending)', async () => {
      mockLogin(admin);
      const res = await request(app).get('/api/v1/reports/finance');
      
      expect(res.statusCode).toBe(200);
      // Should sum payments 1, 2, 3, 4 (total 4)
      expect(res.body.overall[0].count).toBe(4);
      expect(res.body.overall[0].totalAmount).toBe(100 + 150 + 200 + 500); // 950
      // Should only count 'paid'
      expect(res.body.totalsByStatus[0].count).toBe(4);
      expect(res.body.totalsByStatus[0]._id).toBe('paid');
    });

    it('should allow admin to filter by hospitalId', async () => {
      mockLogin(admin);
      const res = await request(app).get(`/api/v1/reports/finance?hospitalId=${hospital1._id}`);
      
      expect(res.statusCode).toBe(200);
      // Should sum payments 1, 2, 3 (total 3)
      expect(res.body.overall[0].count).toBe(3);
      expect(res.body.overall[0].totalAmount).toBe(100 + 150 + 200); // 450
    });

    it('should allow hospitaladmin to get report (defaults to their hospital)', async () => {
      mockLogin(hospitalAdmin); // Belongs to hospital1
      const res = await request(app).get('/api/v1/reports/finance');
      
      expect(res.statusCode).toBe(200);
      // Should sum payments 1, 2, 3 (total 3) from hospital1
      expect(res.body.overall[0].count).toBe(3);
      expect(res.body.overall[0].totalAmount).toBe(450);
    });

    it('should allow admin to filter by date range', async () => {
      mockLogin(admin);
      // Should only include Day 1 (payment1 and payment4)
      const res = await request(app).get('/api/v1/reports/finance?startDate=2023-10-01&endDate=2023-10-01');

      expect(res.statusCode).toBe(200);
      expect(res.body.overall[0].count).toBe(2);
      expect(res.body.overall[0].totalAmount).toBe(100 + 500); // 600
      expect(res.body.totalsByDay.length).toBe(1);
      expect(res.body.totalsByDay[0]._id).toBe('2023-10-01');
    });

    it('should correctly aggregate by doctor (admin view)', async () => {
      mockLogin(admin);
      const res = await request(app).get('/api/v1/reports/finance');

      expect(res.statusCode).toBe(200);
      expect(res.body.totalsByDoctor.length).toBe(2);
      // Doctor 1: payment1 (100) + payment2 (150) = 250
      // Doctor 2: payment3 (200) + payment4 (500) = 700
      const dr1Report = res.body.totalsByDoctor.find(d => d.doctorId.toString() === doctor1._id.toString());
      const dr2Report = res.body.totalsByDoctor.find(d => d.doctorId.toString() === doctor2._id.toString());
      
      expect(dr1Report.totalAmount).toBe(250);
      expect(dr1Report.count).toBe(2);
      expect(dr1Report.doctorName).toBe('Dr. Alice');
      
      expect(dr2Report.totalAmount).toBe(700);
      expect(dr2Report.count).toBe(2);
      expect(dr2Report.doctorName).toBe('Dr. Bob');
    });
  });

  // --- GET /api/v1/reports/patient-visits ---
  describe('GET /api/v1/reports/patient-visits', () => {
    it('should be protected from unauthenticated users', async () => {
      mockLogout();
      const res = await request(app).get('/api/v1/reports/patient-visits');
      expect(res.statusCode).toBe(401);
    });

    it('should not allow patient to access', async () => {
      mockLogin(patient);
      const res = await request(app).get('/api/v1/reports/patient-visits');
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to get report for ALL hospitals (completed only)', async () => {
      mockLogin(admin);
      const res = await request(app).get('/api/v1/reports/patient-visits');
      
      expect(res.statusCode).toBe(200);
      // Should count appts 1, 2, 3, 4 (total 4)
      expect(res.body.overall[0].count).toBe(4);
      // Status is 'completed', but the report groups by original status string
      expect(res.body.visitsByStatus[0].count).toBe(4);
      expect(res.body.visitsByStatus[0]._id).toBe('completed');
    });

    it('should allow admin to filter by hospitalId', async () => {
      mockLogin(admin);
      const res = await request(app).get(`/api/v1/reports/patient-visits?hospitalId=${hospital1._id}`);
      
      expect(res.statusCode).toBe(200);
      // Should count appts 1, 2, 3 (total 3)
      expect(res.body.overall[0].count).toBe(3);
    });

    it('should allow hospitaladmin to get report (defaults to their hospital)', async () => {
      mockLogin(hospitalAdmin); // Belongs to hospital1
      const res = await request(app).get('/api/v1/reports/patient-visits');
      
      expect(res.statusCode).toBe(200);
      // Should count appts 1, 2, 3 (total 3) from hospital1
      expect(res.body.overall[0].count).toBe(3);
    });

    it('should allow admin to filter by date range (using visitDate)', async () => {
      mockLogin(admin);
      // Should only include Day 2 (appt2 and appt3)
      const res = await request(app).get('/api/v1/reports/patient-visits?startDate=2023-10-02&endDate=2023-10-02');

      expect(res.statusCode).toBe(200);
      expect(res.body.overall[0].count).toBe(2);
      expect(res.body.visitsByDay.length).toBe(1);
      expect(res.body.visitsByDay[0]._id).toBe('2023-10-02');
    });

    it('should correctly aggregate by doctor (admin view)', async () => {
      mockLogin(admin);
      const res = await request(app).get('/api/v1/reports/patient-visits');

      expect(res.statusCode).toBe(200);
      expect(res.body.visitsByDoctor.length).toBe(2);
      // Doctor 1: appt1, appt2 (count 2)
      // Doctor 2: appt3, appt4 (count 2)
      const dr1Report = res.body.visitsByDoctor.find(d => d.doctorId.toString() === doctor1._id.toString());
      const dr2Report = res.body.visitsByDoctor.find(d => d.doctorId.toString() === doctor2._id.toString());
      
      expect(dr1Report.count).toBe(2);
      expect(dr1Report.doctorName).toBe('Dr. Alice');
      
      expect(dr2Report.count).toBe(2);
      expect(dr2Report.doctorName).toBe('Dr. Bob');
    });
  });

  // --- GET /api/v1/reports/patient-visits/debug ---
  describe('GET /api/v1/reports/patient-visits/debug', () => {
    
    it('should allow admin to get debug info for a hospital', async () => {
      mockLogin(admin);
      const res = await request(app).get(`/api/v1/reports/patient-visits/debug?hospitalId=${hospital1._id}`);

      expect(res.statusCode).toBe(200);
      // All appointments for hospital1 (1, 2, 3, 5)
      expect(res.body.preCompletedCount[0].count).toBe(4);
      // Completed samples (1, 2, 3)
      expect(res.body.completedSamples.length).toBe(3);
      // Non-completed samples (5)
      expect(res.body.nonCompletedSamples.length).toBe(1);
      expect(res.body.nonCompletedSamples[0].normStatus).toBe('pending');
    });

    it('should filter by date range before sampling', async () => {
      mockLogin(admin);
      // Only Day 1 (appt1 'completed', appt4 'completed' @hosp2)
      // And Day 1 for Hosp1 (appt1 'completed')
      // Let's query Day 3 for Hosp1
      const res = await request(app).get(`/api/v1/reports/patient-visits/debug?hospitalId=${hospital1._id}&startDate=2023-10-03&endDate=2023-10-03`);

      expect(res.statusCode).toBe(200);
      // Only appt5 matches this criteria
      expect(res.body.preCompletedCount[0].count).toBe(1);
      expect(res.body.completedSamples.length).toBe(0);
      expect(res.body.nonCompletedSamples.length).toBe(1);
      expect(res.body.nonCompletedSamples[0]._id.toString()).toBe(appt5._id.toString());
    });
  });
});