// services/expenseService.ts
import api from './api';

export interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  isRecurring?: boolean;
  page?: number;
  pageSize?: number;
}

// Devuelve { items: Expense[], total: number }
export const getExpenses = async (params?: ExpenseFilters) => {
  const { data } = await api.get<{ items: any[]; total: number }>('/expenses', {
    params,
  });
  return data;
};

// Devuelve { total: number; byCategory: Record<string, number> }
export const getExpenseSummary = async (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  const { data } = await api.get<{
    total: number;
    byCategory: Record<string, number>;
  }>('/expenses/summary', { params });
  return data;
};

export const createExpense = async (payload: any) => {
  const { data } = await api.post('/expenses', payload);
  return data;
};

export const updateExpense = async (id: number, payload: any) => {
  const { data } = await api.patch(`/expenses/${id}`, payload);
  return data;
};

export const deleteExpense = async (id: number) => {
  await api.delete(`/expenses/${id}`);
};
