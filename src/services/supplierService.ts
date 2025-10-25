// src/services/supplierService.ts
import api from './api';

export interface Supplier {
  id: number;
  name: string;
  nit?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  website?: string;
  supplierType?: string;
  specializedCategories?: string[];
  paymentTerms?: string;
  creditLimit?: number;
  currentDebt?: number;
  isPreferred: boolean;
  isActive: boolean;
  minOrderAmount?: number;
  leadTimeDays?: number;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    purchases: number;
  };
}

export interface SupplierStatistics {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  preferredSuppliers: number;
  suppliersWithDebt: number;
  totalDebt: number;
  suppliersByType: Array<{
    supplierType: string;
    count: number;
  }>;
  suppliersByPaymentTerms: Array<{
    paymentTerms: string;
    count: number;
  }>;
  mostUsedSuppliers: Array<{
    id: number;
    name: string;
    productCount: number;
    purchaseCount: number;
  }>;
  recentSuppliers: Supplier[];
}

export const getSuppliers = async (params?: {
  includeInactive?: boolean;
  search?: string;
  supplierType?: string;
  paymentTerms?: string;
  isPreferred?: boolean;
  withDebt?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.includeInactive) queryParams.append('includeInactive', 'true');
  if (params?.search) queryParams.append('search', params.search);
  if (params?.supplierType) queryParams.append('supplierType', params.supplierType);
  if (params?.paymentTerms) queryParams.append('paymentTerms', params.paymentTerms);
  if (params?.isPreferred) queryParams.append('isPreferred', 'true');
  if (params?.withDebt) queryParams.append('withDebt', 'true');
  
  const response = await api.get(`/suppliers?${queryParams.toString()}`);
  
  // Si response.data es un array, retornarlo directamente
  if (Array.isArray(response.data)) {
    return response.data;
  }
  
  // Si viene envuelto en un objeto, intentar extraer el array
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  // Si viene con otra estructura, buscar la propiedad que contiene el array
  if (response.data?.suppliers && Array.isArray(response.data.suppliers)) {
    return response.data.suppliers;
  }
  
  console.error('Unexpected suppliers response format:', response.data);
  return [];
};

export const getSupplierStatistics = async (): Promise<SupplierStatistics> => {
  const response = await api.get('/suppliers/statistics');
  return response.data;
};

export const getSupplierFinancialSummary = async () => {
  const response = await api.get('/suppliers/financial/summary');
  return response.data;
};

export const getSuppliersByType = async (type: string): Promise<Supplier[]> => {
  const response = await api.get(`/suppliers/by-type/${type}`);
  return response.data;
};

export const getSuppliersWithDebt = async (): Promise<Supplier[]> => {
  const response = await api.get('/suppliers/with-debt');
  return response.data;
};

export const getSupplierById = async (id: number): Promise<Supplier> => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (supplier: Partial<Supplier>) => {
  const response = await api.post('/suppliers', supplier);
  return response.data;
};

export const updateSupplier = async (id: number, supplier: Partial<Supplier>) => {
  const response = await api.put(`/suppliers/${id}`, supplier);
  return response.data;
};

export const deleteSupplier = async (id: number) => {
  await api.delete(`/suppliers/${id}`);
};

export const toggleSupplierStatus = async (id: number) => {
  const response = await api.put(`/suppliers/${id}/toggle-status`);
  return response.data;
};

export const toggleSupplierPreferred = async (id: number) => {
  const response = await api.put(`/suppliers/${id}/toggle-preferred`);
  return response.data;
};

export const updateSupplierDebt = async (id: number, amount: number, operation: 'ADD' | 'SUBTRACT') => {
  const response = await api.put(`/suppliers/${id}/debt`, { amount, operation });
  return response.data;
};

export interface SupplierAnalytics {
  totalSuppliers: number;
  activeSuppliers: number;
  preferredSuppliers: number;
  suppliersWithDebt: number;
  totalDebt: number;
  totalCreditLimit: number;
  typeDistribution: Record<string, number>;
  topDebtors: {
    id: string;
    name: string;
    currentDebt: number;
    creditLimit?: number;
    debtPercentage: number;
  }[];
  metrics: {
    activePercentage: number;
    preferredPercentage: number;
    creditUtilization: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export const getSupplierAnalytics = async (): Promise<SupplierAnalytics> => {
  const response = await api.get('/suppliers/analytics');
  return response.data;
};
