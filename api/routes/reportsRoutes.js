import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getFinanceReport, getPatientVisitReport, getPatientVisitDebug } from '../controllers/reportsController.js';

const router = express.Router();

// Discoverability: list available report endpoints
router.get('/', protect, authorize('hospitaladmin', 'admin'), (req, res) => {
  return res.json({
    reports: [
      {
        key: 'finance',
        method: 'GET',
        path: '/api/v1/reports/finance',
        query: ['startDate (YYYY-MM-DD)', 'endDate (YYYY-MM-DD)', 'hospitalId (optional)'],
        description: 'Aggregated paid payments totals by status, type, day, and doctor',
      },
      {
        key: 'patient-visits',
        method: 'GET',
        path: '/api/v1/reports/patient-visits',
        query: ['startDate (YYYY-MM-DD)', 'endDate (YYYY-MM-DD)', 'hospitalId (optional)'],
        description: 'Aggregated completed appointments by status, day, and doctor',
      },
    ],
  });
});

// Only hospital admins and system admins can access reports
router.get('/finance', protect, authorize('hospitaladmin', 'admin'), getFinanceReport);
router.get('/patient-visits', protect, authorize('hospitaladmin', 'admin'), getPatientVisitReport);
router.get('/patient-visits/debug', protect, authorize('hospitaladmin', 'admin'), getPatientVisitDebug);

export default router;


