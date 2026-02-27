// ============================================
// Accounts Service - REMOVED
// All account-related logic has been moved to admin service
// This file is kept as a stub to prevent import errors
// ============================================

export interface IncomeRecord {
  id?: string;
  income_id: string;
  source: string;
  category_id?: string;
  description?: string;
  amount_aed: number;
  date: string;
  status: 'received' | 'pending';
  payment_mode: string;
  receipt_number?: string;
  notes?: string;
  created_by?: string;
}

export interface ExpenseRecord {
  id?: string;
  expense_id: string;
  category_id?: string;
  vendor: string;
  description?: string;
  amount_aed: number;
  date: string;
  status: 'paid' | 'pending';
  payment_mode: string;
  invoice_number?: string;
  receipt_url?: string;
  notes?: string;
  created_by?: string;
  approved_by?: string;
}

// Stub functions - all logic moved to adminService
export const getAllIncome = async () => {
  console.warn('❌ accountsService.getAllIncome is deprecated. Use adminService.getIncomeRecords instead.');
  return [];
};

export const getIncomeById = async () => {
  console.warn('❌ accountsService.getIncomeById is deprecated. Use adminService.getIncomeRecordById instead.');
  return null;
};

export const createIncome = async () => {
  console.warn('❌ accountsService.createIncome is deprecated. Use adminService.createIncomeRecord instead.');
  return null;
};

export const updateIncome = async () => {
  console.warn('❌ accountsService.updateIncome is deprecated. Use adminService.updateIncomeRecord instead.');
  return null;
};

export const deleteIncome = async () => {
  console.warn('❌ accountsService.deleteIncome is deprecated. Use adminService.deleteIncomeRecord instead.');
  return null;
};

export const getIncomeCategories = async () => {
  console.warn('❌ accountsService.getIncomeCategories is deprecated.');
  return [];
};

export const getAllExpenses = async () => {
  console.warn('❌ accountsService.getAllExpenses is deprecated.');
  return [];
};

export const getExpenseById = async () => {
  console.warn('❌ accountsService.getExpenseById is deprecated.');
  return null;
};

export const createExpense = async () => {
  console.warn('❌ accountsService.createExpense is deprecated.');
  return null;
};

export const updateExpense = async () => {
  console.warn('❌ accountsService.updateExpense is deprecated.');
  return null;
};

export const deleteExpense = async () => {
  console.warn('❌ accountsService.deleteExpense is deprecated.');
  return null;
};

export const getExpenseCategories = async () => {
  console.warn('❌ accountsService.getExpenseCategories is deprecated.');
  return [];
};

export const getVendors = async () => {
  console.warn('❌ accountsService.getVendors is deprecated.');
  return [];
};

export const getFinancialSummary = async () => {
  console.warn('❌ accountsService.getFinancialSummary is deprecated.');
  return null;
};

export const getIncomeByCategory = async () => {
  console.warn('❌ accountsService.getIncomeByCategory is deprecated.');
  return null;
};

export const getExpensesByCategory = async () => {
  console.warn('❌ accountsService.getExpensesByCategory is deprecated.');
  return null;
};