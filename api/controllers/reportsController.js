// controllers/reportsController.js
import asyncHandler from 'express-async-handler';
import {
  generateFinanceReport,
  generatePatientVisitReport,
  generatePatientVisitDebug,
} from '../services/reportService.js';

export const getFinanceReport = asyncHandler(async (req, res) => {
  const reportData = await generateFinanceReport(req.query, req.user);
  res.json(reportData);
});

export const getPatientVisitReport = asyncHandler(async (req, res) => {
  const reportData = await generatePatientVisitReport(req.query, req.user);
  res.json(reportData);
});

export const getPatientVisitDebug = asyncHandler(async (req, res) => {
  const debugData = await generatePatientVisitDebug(req.query, req.user);
  res.json(debugData);
});