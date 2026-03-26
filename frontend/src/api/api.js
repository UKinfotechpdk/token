import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auth
// Auth
export const login = (data) => api.post('/login', data);
export const adminLogin = (data) => api.post('/admin-login', data);
export const staffLogin = (data) => api.post('/staff-login', data);
export const consultantLogin = (data) => api.post('/consultant-login', data);
export const userLogin = (data) => api.post('/user-login', data);
export const register = (data) => api.post('/register', data);
export const logout = () => api.post('/logout');
export const checkAuth = () => api.get('/me');
export const getMySchedules = () => api.get('/consultant-schedules');
export const getStaffSchedules = () => api.get('/staff-schedules');

// Consultants (admin management)
export const getConsultants = () => api.get('/consultants');
export const createConsultant = (data) => api.post('/consultants', data);
export const updateConsultant = (id, data) => api.put(`/consultants/${id}`, data);
export const deleteConsultant = (id) => api.delete(`/consultants/${id}`);

// Branches
export const getBranches = () => api.get('/branches');
export const createBranch = (data) => api.post('/branches', data);
export const updateBranch = (id, data) => api.put(`/branches/${id}`, data);
export const deleteBranch = (id) => api.delete(`/branches/${id}`);

// Staff
export const getStaff = () => api.get('/staff');
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// Schedules
export const getSchedules = () => api.get('/schedules');
export const getSchedule = (id) => api.get(`/schedules/${id}`);
export const createSchedule = (data) => api.post('/schedules', data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);
export const getTokens = (scheduleId) => api.get(`/schedules/${scheduleId}/tokens`);
export const updateTokenStatus = (tokenId, data) => api.put(`/tokens/${tokenId}/status`, data);
export const getNextSeries = () => api.get('/schedules/next-series');
export const getTokenConfig = () => api.get('/token-config');
export const updateTokenConfig = (data) => api.put('/token-config', data);

// Payments
export const getPayments = (params) => api.get('/payments', { params });
export const createPayment = (data) => api.post('/payments', data);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
export const getPaymentSummary = () => api.get('/payments/summary');
// Public Kiosk API
export const getPublicBranches = () => api.get('/public/branches');
export const getServices = () => api.get('/public/services');
export const getPublicConsultants = (branchId, specialization) => api.get(`/public/consultants?branch_id=${branchId}&specialization=${specialization}`);
export const getPublicSchedules = (branchId, consultantId) => api.get(`/public/schedules?branch_id=${branchId}&consultant_id=${consultantId}`);
export const bookToken = (data) => api.post('/public/token/book', data);
export const getPublicTokenStatus = (schedule_id) => api.get(`/public/token-status/${schedule_id}`);
export const getTokenStatusSummary = (scheduleId) => api.get(`/public/status-check/${scheduleId}`);
export const getBranchBoard = (branchId) => api.get(`/public/board/${branchId}`);
export const getMyTokens = () => api.get('/public/my-tokens');
export const createPaymentOrder = (data) => api.post('/public/create-payment-order', data);
export const verifyPayment = (data) => api.post('/public/verify-payment', data);
export const downloadToken = (tokenId) => api.get(`/public/token/${tokenId}/download`, { responseType: 'blob' });

export default api;
