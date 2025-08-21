// services/expenseService.ts
import api from './api';

export interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  paymentMethod?: string;
  search?: string;
  isRecurring?: boolean;
  page?: number;
  pageSize?: number;
}

// Devuelve { items: Expense[], total: number }
export const getExpenses = async (params?: ExpenseFilters) => {
  const response = await api.get<{ items: any[]; total: number }>('/expenses', {
    params,
  });
  
  // Verificar si la respuesta tiene el wrapper de success
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data; // Extraer data del wrapper
  } else {
    return response.data; // Usar directamente si no hay wrapper
  }
};

// Devuelve el resumen expandido
export const getExpenseSummary = async (params?: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<{
  total: number;
  dailyAverage: number;
  previousMonthTotal: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
}> => {
  const response = await api.get('/expenses/summary', { params });
  
  // Verificar si la respuesta tiene el wrapper de success
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data; // Extraer data del wrapper
  } else {
    return response.data; // Usar directamente si no hay wrapper
  }
};

export const createExpense = async (payload: any) => {
  const response = await api.post('/expenses', payload);
  
  // Verificar si la respuesta tiene el wrapper de success
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data; // Extraer data del wrapper
  } else {
    return response.data; // Usar directamente si no hay wrapper
  }
};

export const updateExpense = async (id: number, payload: any) => {
  const response = await api.patch(`/expenses/${id}`, payload);
  
  // Verificar si la respuesta tiene el wrapper de success
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data; // Extraer data del wrapper
  } else {
    return response.data; // Usar directamente si no hay wrapper
  }
};

export const deleteExpense = async (id: number) => {
  await api.delete(`/expenses/${id}`);
};
