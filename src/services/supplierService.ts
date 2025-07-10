// src/services/supplierService.ts
import api from './api';

export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return response.data;
};

export const createSupplier = async (supplier: any) => {
  const response = await api.post('/suppliers', supplier);
  return response.data;
};

export const updateSupplier = async (id: number, supplier: any) => {
  const response = await api.put(`/suppliers/${id}`, supplier);
  return response.data;
};

export const deleteSupplier = async (id: number) => {
  await api.delete(`/suppliers/${id}`);
};
