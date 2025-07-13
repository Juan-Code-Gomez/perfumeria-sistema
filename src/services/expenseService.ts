// services/expenseService.ts
import api from './api';

export const getExpenses = async (params?: any) => {
  const { data } = await api.get('/expenses', { params });
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
