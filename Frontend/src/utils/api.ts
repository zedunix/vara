import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string }) => 
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/profile', data),
  
  // User Approval Management (Admin only)
  getPendingUsers: () => api.get('/auth/pending-users'),
  approveUser: (userId: string) => api.post(`/auth/approve/${userId}`),
  rejectUser: (userId: string) => api.post(`/auth/reject/${userId}`),
};

// ============ MEMBERS API ============
export const membersAPI = {
  getAll: (params?: { status?: string; membership_type?: string; search?: string }) => 
    api.get('/members', { params }),
  getProfile: () => api.get('/members/me/profile'),
  getById: (id: string) => 
    api.get(`/members/${id}`),
  create: (data: Record<string, unknown>) => api.post('/members', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
  getStats: () => api.get('/members/stats'),
  getMembershipTypes: () => api.get('/members/types'),
};

// ============ APPLICATIONS API ============
export const applicationsAPI = {
  getAll: (params?: { status?: string; membership_type?: string }) => 
    api.get('/applications', { params }),
  getById: (id: string) => api.get(`/applications/${id}`),
  create: (data: Record<string, unknown>) => api.post('/applications', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/applications/${id}`, data),
  approve: (id: string, data?: { notes?: string }) => api.post(`/applications/${id}/approve`, data),
  reject: (id: string, data?: { reason?: string }) => api.post(`/applications/${id}/reject`, data),
  getStats: () => api.get('/applications/stats'),
};

// ============ ACCOUNTS API ============
export const accountsAPI = {
  // Income
  getIncome: (params?: { category?: string; startDate?: string; endDate?: string }) => 
    api.get('/accounts/income', { params }),
  createIncome: (data: Record<string, unknown>) => api.post('/accounts/income', data),
  updateIncome: (id: string, data: Record<string, unknown>) => api.put(`/accounts/income/${id}`, data),
  deleteIncome: (id: string) => api.delete(`/accounts/income/${id}`),
  
  // Expenses
  getExpenses: (params?: { category?: string; vendor?: string; startDate?: string; endDate?: string }) => 
    api.get('/accounts/expenses', { params }),
  createExpense: (data: Record<string, unknown>) => api.post('/accounts/expenses', data),
  updateExpense: (id: string, data: Record<string, unknown>) => api.put(`/accounts/expenses/${id}`, data),
  deleteExpense: (id: string) => api.delete(`/accounts/expenses/${id}`),
  
  // Categories & Vendors
  getCategories: (type?: 'income' | 'expense') => api.get('/accounts/categories', { params: { type } }),
  getVendors: () => api.get('/accounts/vendors'),
  
  // Summary & Reports
  getSummary: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/accounts/summary', { params }),
  getBalance: () => api.get('/accounts/balance'),
};

// ============ EVENTS API ============
export const eventsAPI = {
  // Events
  getAll: (params?: { status?: string; type?: string }) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => api.post('/events', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  register: (eventId: string) => api.post(`/events/${eventId}/register`),
  getRegistrations: (eventId: string) => api.get(`/events/${eventId}/registrations`),
  
  // Announcements
  getAnnouncements: (params?: { category?: string }) => api.get('/events/announcements', { params }),
  createAnnouncement: (data: Record<string, unknown>) => api.post('/events/announcements', data),
  updateAnnouncement: (id: string, data: Record<string, unknown>) => api.put(`/events/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/events/announcements/${id}`),
};

// ============ JOBS API ============
export const jobsAPI = {
  // Job Postings
  getAll: (params?: { status?: string; type?: string; search?: string }) => 
    api.get('/jobs', { params }),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: Record<string, unknown>) => api.post('/jobs', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  
  // Applicants
  getApplicants: (jobId: string) => api.get(`/jobs/${jobId}/applicants`),
  apply: (jobId: string, data: Record<string, unknown>) => api.post(`/jobs/${jobId}/apply`, data),
  updateApplicantStatus: (jobId: string, applicantId: string, status: string) => 
    api.patch(`/jobs/${jobId}/applicants/${applicantId}`, { status }),
};

// ============ ADMIN API ============
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: () => api.get('/admin/stats'),
  getProfile: () => api.get('/admin/profile'),
  
  // Board Members & Admin Role Management
  getBoardMembers: () => api.get('/admin/board-members'),
  createBoardMember: (data: Record<string, unknown>) => api.post('/admin/board-members', data),
  updateBoardMember: (id: string, data: Record<string, unknown>) => api.put(`/admin/board-members/${id}`, data),
  deleteBoardMember: (id: string) => api.delete(`/admin/board-members/${id}`),
  
  // Search and Assign Admin Roles
  searchUsersByEmail: (email: string) => api.get('/admin/search-users', { params: { email } }),
  assignAdminRole: (userId: string, role: 'admin' | 'superadmin') => 
    api.post('/admin/assign-role', { userId, role }),
  updateAdminRole: (userId: string, role: 'admin' | 'superadmin') => 
    api.put(`/admin/users/${userId}/role`, { role }),
  
  // Income Records
  getIncomeRecords: (params?: { status?: string; source?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) => 
    api.get('/admin/income-records', { params }),
  getIncomeRecordById: (id: string) => api.get(`/admin/income-records/${id}`),
  createIncomeRecord: (data: Record<string, unknown>) => api.post('/admin/income-records', data),
  updateIncomeRecord: (id: string, data: Record<string, unknown>) => api.put(`/admin/income-records/${id}`, data),
  deleteIncomeRecord: (id: string) => api.delete(`/admin/income-records/${id}`),
  getIncomeSummary: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/admin/income-summary', { params }),
  
  // Expense Records
  getExpenseRecords: (params?: { status?: string; category_id?: string; vendor_id?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) => 
    api.get('/admin/expense-records', { params }),
  getExpenseRecordById: (id: string) => api.get(`/admin/expense-records/${id}`),
  createExpenseRecord: (data: Record<string, unknown>) => api.post('/admin/expense-records', data),
  updateExpenseRecord: (id: string, data: Record<string, unknown>) => api.put(`/admin/expense-records/${id}`, data),
  deleteExpenseRecord: (id: string) => api.delete(`/admin/expense-records/${id}`),
  getExpenseSummary: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/admin/expense-summary', { params }),
  
  // Events (Admin - can manage draft and published)
  getEventsAdmin: () => api.get('/admin/events'), // Get all events including drafts
  createEvent: (data: Record<string, unknown>) => api.post('/admin/events', data),
  updateEvent: (id: string, data: Record<string, unknown>) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/admin/events/${id}`),
  
  // Announcements (Admin - can manage draft and published)
  getAnnouncementsAdmin: () => api.get('/admin/announcements-admin'),
  createAnnouncement: (data: Record<string, unknown>) => api.post('/admin/announcements', data),
  updateAnnouncement: (id: string, data: Record<string, unknown>) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),
  
  // Jobs (Admin - can manage draft and published)
  getJobsAdmin: () => api.get('/admin/jobs'),
  createJob: (data: Record<string, unknown>) => api.post('/admin/jobs', data),
  updateJob: (id: string, data: Record<string, unknown>) => api.put(`/admin/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete(`/admin/jobs/${id}`),
  
  // Activity & Notifications
  getActivityLogs: (params?: { limit?: number }) => api.get('/admin/activity-logs', { params }),
  getNotifications: () => api.get('/admin/notifications'),
  getRoleBasedNotifications: () => api.get('/admin/notifications/dashboard'),
  markNotificationRead: (id: string) => api.patch(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.post('/admin/notifications/read-all'),
};

// ============ PUBLIC API (Read-Only) ============
export const publicAPI = {
  // Events (Read-Only - published only)
  getEvents: () => api.get('/public/events'),
  getEventById: (id: string) => api.get(`/public/events/${id}`),
  
  // Announcements (Read-Only - published only)
  getAnnouncements: () => api.get('/public/announcements'),
  getAnnouncementById: (id: string) => api.get(`/public/announcements/${id}`),
};

export default api;
