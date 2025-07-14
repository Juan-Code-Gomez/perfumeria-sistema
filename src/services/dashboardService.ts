// src/services/dashboardService.ts
import api from './api';

export const getDashboard = async (params?: { dateFrom?: string; dateTo?: string }) => {
  const { data } = await api.get('/dashboard/summary', { params });
  return data;
};
