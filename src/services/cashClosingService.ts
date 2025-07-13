import api from './api';

export const getCashClosings = async (params?: { dateFrom?: string; dateTo?: string }) => {
  const { data } = await api.get('/cash-closing', { params });
  return data;
};

export const createCashClosing = async (payload: any) => {
  const { data } = await api.post('/cash-closing', payload);
  return data;
};
