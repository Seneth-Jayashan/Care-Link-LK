import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

// Finance report: totals by date range, paymentType, status, doctor, and overall
export const getFinanceReport = async (req, res) => {
  try {
    const { startDate, endDate, hospitalId } = req.query;

    if (!req.user?.role || !['hospitaladmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const match = {};
    if (hospitalId) match.hospital = hospitalId;
    // If hospital admin, default to their hospital when not explicitly provided
    if (!hospitalId && req.user.role === 'hospitaladmin' && req.user.hospital) {
      match.hospital = req.user.hospital;
    }
    // Finance should reflect realized revenue only
    match.status = 'paid';
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        match.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        match.createdAt.$lte = e;
      }
    }

    const pipeline = [
      { $match: match },
      {
        $facet: {
          totalsByStatus: [
            { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          totalsByType: [
            { $group: { _id: '$paymentType', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          totalsByDay: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          totalsByDoctor: [
            { $group: { _id: '$doctor', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
            { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, doctorId: '$doctor._id', doctorName: '$doctor.name', totalAmount: 1, count: 1 } },
            { $sort: { totalAmount: -1 } },
          ],
          overall: [
            { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $project: { _id: 0 } },
          ],
        },
      },
    ];

    const [result] = await Payment.aggregate(pipeline);
    return res.json(result || { totalsByStatus: [], totalsByType: [], totalsByDay: [], totalsByDoctor: [], overall: [] });
  } catch (err) {
    console.error('Error generating finance report', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Patient visit report: counts by status/date/doctor within hospital
export const getPatientVisitReport = async (req, res) => {
  try {
    const { startDate, endDate, hospitalId } = req.query;

    if (!req.user?.role || !['hospitaladmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const match = {};
    if (hospitalId) {
      try {
        match.hospital = new mongoose.Types.ObjectId(hospitalId);
      } catch {
        match.hospital = hospitalId; // fallback if already ObjectId-like
      }
    }
    if (!hospitalId && req.user.role === 'hospitaladmin' && req.user.hospital) {
      match.hospital = req.user.hospital;
    }
    // We'll normalize status later (to handle casing/whitespace)
    // Build date boundaries for filtering using visitDate (appointmentDate fallback to createdAt)
    const dateMatch = {};
    if (startDate || endDate) {
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        dateMatch.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        dateMatch.$lte = e;
      }
    }

    const pipeline = [
      { $match: match },
      // Normalize fields: visitDate and normalized status
      { $addFields: {
          normStatus: { $toLower: { $trim: { input: '$status' } } },
          // Use completion time for completed visits, otherwise fall back to appointment/created time
          visitDate: {
            $cond: [
              { $eq: [{ $toLower: { $trim: { input: '$status' } } }, 'completed'] },
              { $ifNull: ['$updatedAt', { $ifNull: ['$appointmentDate', '$createdAt'] }] },
              { $ifNull: ['$appointmentDate', '$createdAt'] }
            ]
          },
        }
      },
      // Only count actually visited patients (completed appointments)
      { $match: { normStatus: 'completed' } },
      // Apply date range on visitDate when provided
      ...(Object.keys(dateMatch).length ? [{ $match: { visitDate: dateMatch } }] : []),
      {
        $facet: {
          visitsByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          visitsByDay: [
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          visitsByDoctor: [
            { $group: { _id: '$doctor', count: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
            { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, doctorId: '$doctor._id', doctorName: '$doctor.name', count: 1 } },
            { $sort: { count: -1 } },
          ],
          overall: [
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } },
          ],
        },
      },
    ];

    const [result] = await Appointment.aggregate(pipeline);
    return res.json(result || { visitsByStatus: [], visitsByDay: [], visitsByDoctor: [], overall: [] });
  } catch (err) {
    console.error('Error generating patient visit report', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Debug endpoint to inspect matching appointments for patient visits
export const getPatientVisitDebug = async (req, res) => {
  try {
    const { startDate, endDate, hospitalId, limit = 20 } = req.query;

    const match = {};
    if (hospitalId) {
      try {
        match.hospital = new mongoose.Types.ObjectId(hospitalId);
      } catch {
        match.hospital = hospitalId;
      }
    }
    if (!hospitalId && req.user.role === 'hospitaladmin' && req.user.hospital) {
      match.hospital = req.user.hospital;
    }

    const dateMatch = {};
    if (startDate) {
      const s = new Date(startDate); s.setHours(0,0,0,0); dateMatch.$gte = s;
    }
    if (endDate) {
      const e = new Date(endDate); e.setHours(23,59,59,999); dateMatch.$lte = e;
    }

    const pipeline = [
      { $match: match },
      { $addFields: {
          normStatus: { $toLower: { $trim: { input: '$status' } } },
          visitDate: {
            $cond: [
              { $eq: [{ $toLower: { $trim: { input: '$status' } } }, 'completed'] },
              { $ifNull: ['$updatedAt', { $ifNull: ['$appointmentDate', '$createdAt'] }] },
              { $ifNull: ['$appointmentDate', '$createdAt'] }
            ]
          },
        }
      },
      ...(Object.keys(dateMatch).length ? [{ $match: { visitDate: dateMatch } }] : []),
      { $facet: {
          preCompletedCount: [ { $count: 'count' } ],
          completedSamples: [ { $match: { normStatus: 'completed' } }, { $limit: Number(limit) } ],
          nonCompletedSamples: [ { $match: { normStatus: { $ne: 'completed' } } }, { $limit: Number(limit) } ],
        }
      },
    ];

    const [result] = await Appointment.aggregate(pipeline);
    return res.json(result || {});
  } catch (err) {
    console.error('Error in patient visit debug', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


