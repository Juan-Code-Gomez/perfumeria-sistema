// src/services/companyConfigService.ts
import axios from 'axios';
import type { CompanyConfig, CreateCompanyConfigData } from '../features/company-config/companyConfigSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/company-config`,
});

// Interceptor para agregar el token de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const companyConfigService = {
  // Obtener configuración pública (sin autenticación)
  async getPublicConfig(): Promise<{ companyName: string; logo?: string }> {
    // Usar axios directamente sin interceptors para evitar agregar token
    const response = await axios.get(`${API_URL}/company-config/public`);
    return response.data.data; // Extraer el campo 'data' de la respuesta
  },

  // Obtener configuración actual
  async getCurrent(): Promise<CompanyConfig> {
    const response = await api.get('/');
    return response.data;
  },

  // Actualizar configuración actual
  async updateCurrent(data: CreateCompanyConfigData): Promise<CompanyConfig> {
    const response = await api.put('/current', data);
    return response.data;
  },

  // Obtener configuración específica para facturas
  async getInvoiceConfig(): Promise<any> {
    const response = await api.get('/invoice-config');
    return response.data;
  },

  // Obtener configuración específica para POS
  async getPOSConfig(): Promise<any> {
    const response = await api.get('/pos-config');
    return response.data;
  },

  // Obtener configuración del sistema
  async getSystemConfig(): Promise<any> {
    const response = await api.get('/system-config');
    return response.data;
  },

  // Crear nueva configuración
  async create(data: CreateCompanyConfigData): Promise<CompanyConfig> {
    const response = await api.post('/', data);
    return response.data;
  },

  // Actualizar configuración por ID
  async update(id: number, data: CreateCompanyConfigData): Promise<CompanyConfig> {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Eliminar configuración
  async delete(id: number): Promise<void> {
    await api.delete(`/${id}`);
  },
};
