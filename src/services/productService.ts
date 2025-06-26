import api from './api';

export const getProducts = async (filters?: {
  name?: string;
  categoryId?: number;
  stockMin?: number;
}) => {
  const response = await api.get('/products', { params: filters });
  return response.data;
};

export const createProduct = async (product: any) => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: number, product: any) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};