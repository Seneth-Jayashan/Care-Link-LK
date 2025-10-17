import api from './api';

export const listReports = () => api.get('/reports');
export const getFinanceReport = (params) => api.get('/reports/finance', { params });
export const getPatientVisitReport = (params) => api.get('/reports/patient-visits', { params });

export default {
  listReports,
  getFinanceReport,
  getPatientVisitReport,
};


