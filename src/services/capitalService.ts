// src/services/capitalService.ts
import api from './api';

export interface Capital {
  id: number;
  cash: number;
  bank: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapitalSummary {
  cash: number;
  bank: number;
  total: number;
  lastUpdate: string | null;
}

export interface CreateCapitalData {
  cash: number;
  bank: number;
  description?: string;
}

export interface UpdateCapitalData {
  cash?: number;
  bank?: number;
  description?: string;
}

// Interfaz para la respuesta envuelta del backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const getCapitalHistory = async (): Promise<Capital[]> => {
  const response = await api.get<ApiResponse<Capital[]>>('/capital');
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Capital[];
};

export const getCapitalSummary = async (): Promise<CapitalSummary> => {
  const response = await api.get<ApiResponse<CapitalSummary>>('/capital/summary');
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as CapitalSummary;
};

export const getLatestCapital = async (): Promise<Capital | null> => {
  const response = await api.get<ApiResponse<Capital | null>>('/capital/latest');
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Capital | null;
};

export const createCapital = async (data: CreateCapitalData): Promise<Capital> => {
  const response = await api.post<ApiResponse<Capital>>('/capital', data);
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Capital;
};

export const updateCapital = async (id: number, data: UpdateCapitalData): Promise<Capital> => {
  const response = await api.patch<ApiResponse<Capital>>(`/capital/${id}`, data);
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Capital;
};

export const deleteCapital = async (id: number): Promise<void> => {
  await api.delete(`/capital/${id}`);
};
