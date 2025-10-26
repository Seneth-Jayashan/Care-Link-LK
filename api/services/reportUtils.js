// services/reportUtils.js
import mongoose from 'mongoose';
import { NORM_APPOINTMENT_STATUS } from '../constants/reportConstants.js'; // Import constants


export const buildReportMatchStage = (queryParams, user, dateField = 'createdAt') => {
  const { startDate, endDate, hospitalId } = queryParams;
  const match = {};

  let targetHospitalId = hospitalId;
  if (!targetHospitalId && user.role === 'hospitaladmin' && user.hospital) {
    targetHospitalId = user.hospital;
  }

  if (targetHospitalId) {
    try {
      match.hospital = new mongoose.Types.ObjectId(targetHospitalId);
    } catch {
      match.hospital = targetHospitalId;
      console.warn("Could not convert hospitalId to ObjectId:", targetHospitalId);
    }
  } else if (user.role === 'hospitaladmin' && !user.hospital) {
    match._id = new mongoose.Types.ObjectId(); // Match nothing
  }

  if (startDate || endDate) {
    match[dateField] = {};
    if (startDate) {
      try {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        match[dateField].$gte = s;
      } catch (e) { console.warn("Invalid start date format:", startDate); delete match[dateField]; }
    }
    if (endDate && match[dateField]) {
       try {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        match[dateField].$lte = e;
       } catch (e) { console.warn("Invalid end date format:", endDate); delete match[dateField].$lte; if (!match[dateField].$gte) delete match[dateField]; }
    } else if (endDate) {
         try {
             match[dateField] = {};
             const e = new Date(endDate);
             e.setHours(23, 59, 59, 999);
             match[dateField].$lte = e;
         } catch(e) { console.warn("Invalid end date format:", endDate); }
    }
  }
  return match;
};


export const addVisitDateFields = {
  $addFields: {
    normStatus: { $toLower: { $trim: { input: '$status' } } },
    visitDate: {
      $cond: [
        { $eq: [ { $toLower: { $trim: { input: '$status' } } }, NORM_APPOINTMENT_STATUS.COMPLETED ] },
        { $ifNull: ['$updatedAt', '$appointmentDate', '$createdAt'] },
        { $ifNull: ['$appointmentDate', '$createdAt'] }
      ]
    },
  }
};

/**
 * @param {object} queryParams - The req.query object.
 * @param {string} dateField - The field name to match against.
 * @returns {Array} An array containing the $match stage, or an empty array if no dates provided.
 */
export const buildDateMatchStage = (queryParams, dateField) => {
  const { startDate, endDate } = queryParams;
  const dateMatch = {};
  if (startDate) {
    try { const s = new Date(startDate); s.setHours(0, 0, 0, 0); dateMatch.$gte = s; } catch { /* ignore invalid */ }
  }
  if (endDate) {
    try { const e = new Date(endDate); e.setHours(23, 59, 59, 999); dateMatch.$lte = e; } catch { /* ignore invalid */ }
  }
  return Object.keys(dateMatch).length ? [{ $match: { [dateField]: dateMatch } }] : [];
};


export const defaultFinanceResult = {
  totalsByStatus: [],
  totalsByType: [],
  totalsByDay: [],
  totalsByDoctor: [],
  overall: [{ totalAmount: 0, count: 0 }]
};


export const defaultVisitResult = {
  visitsByStatus: [],
  visitsByDay: [],
  visitsByDoctor: [],
  overall: [{ count: 0 }]
};


export const defaultVisitDebugResult = {
  preFilterCount: [{ count: 0 }],
  completedSamples: [],
  nonCompletedSamples: []
};