// services/reportService.js
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';
import {
  buildReportMatchStage,
  addVisitDateFields,
  buildDateMatchStage,
  defaultFinanceResult,
  defaultVisitResult,
  defaultVisitDebugResult 
} from './reportUtils.js'; 
import { PAYMENT_STATUS, NORM_APPOINTMENT_STATUS } from '../constants/reportConstants.js'; 


export const generateFinanceReport = async (queryParams, user) => {
  const matchStage = buildReportMatchStage(queryParams, user, 'createdAt');

  matchStage.status = PAYMENT_STATUS.PAID;

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        totalsByStatus: [
          { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
        ],
        totalsByType: [
          { $group: { _id: '$paymentType', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
        ],
        totalsByDay: [
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }, // Sort chronologically
        ],
        totalsByDoctor: [
          { $group: { _id: '$doctor', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctorInfo' } },
          { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } }, // Keep results even if doctor lookup fails
          { $project: { _id: 0, doctorId: '$_id', doctorName: '$doctorInfo.name', totalAmount: 1, count: 1 } },
          { $sort: { totalAmount: -1 } }, // Sort by highest revenue
        ],
        overall: [
          { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $project: { _id: 0 } }, // Remove the null _id
        ],
      },
    },
  ];

  const [result] = await Payment.aggregate(pipeline);

  return result || defaultFinanceResult;
};


export const generatePatientVisitReport = async (queryParams, user) => {
  const baseMatch = buildReportMatchStage(queryParams, user, 'createdAt');
  const visitDateMatchStages = buildDateMatchStage(queryParams, 'visitDate');

  const pipeline = [
    { $match: baseMatch },
    addVisitDateFields,
    { $match: { normStatus: NORM_APPOINTMENT_STATUS.COMPLETED } },
    ...visitDateMatchStages,
    {
      $facet: {
        visitsByStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        visitsByDay: [
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        visitsByDoctor: [
          { $group: { _id: '$doctor', count: { $sum: 1 } } },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctorInfo' } },
          { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
          { $project: { _id: 0, doctorId: '$_id', doctorName: '$doctorInfo.name', count: 1 } },
          { $sort: { count: -1 } }, // Sort by most visits
        ],
        overall: [
          { $group: { _id: null, count: { $sum: 1 } } },
          { $project: { _id: 0 } },
        ],
      },
    },
  ];

  const [result] = await Appointment.aggregate(pipeline);

  return result || defaultVisitResult;
};


export const generatePatientVisitDebug = async (queryParams, user) => {
    const { limit = 20 } = queryParams;
    const baseMatch = buildReportMatchStage(queryParams, user, 'createdAt');
    const visitDateMatchStages = buildDateMatchStage(queryParams, 'visitDate');

    const pipeline = [
        { $match: baseMatch },
        addVisitDateFields,
        ...visitDateMatchStages,
        { $facet: {
            preFilterCount: [ { $count: 'count' } ], 
            completedSamples: [
                { $match: { normStatus: NORM_APPOINTMENT_STATUS.COMPLETED } },
                { $limit: Number(limit) } // Limit sample size
            ],
            nonCompletedSamples: [
                { $match: { normStatus: { $ne: NORM_APPOINTMENT_STATUS.COMPLETED } } },
                { $limit: Number(limit) } // Limit sample size
            ],
          }
        },
    ];

    const [result] = await Appointment.aggregate(pipeline);

    const finalResult = {
        preFilterCount: defaultVisitDebugResult.preFilterCount, // e.g., [{ count: 0 }]
        completedSamples: defaultVisitDebugResult.completedSamples, // e.g., []
        nonCompletedSamples: defaultVisitDebugResult.nonCompletedSamples // e.g., []
    };

    if (result) {
        if (result.preFilterCount && result.preFilterCount.length > 0) {
            finalResult.preFilterCount = result.preFilterCount;
        }
        finalResult.completedSamples = result.completedSamples || [];
        finalResult.nonCompletedSamples = result.nonCompletedSamples || [];
    }

    console.log("generatePatientVisitDebug: Final result:", JSON.stringify(finalResult, null, 2)); // Log added for debugging

    return finalResult;
};