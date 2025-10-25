// src/services/invoicePaymentService.ts
import api from './api';

export interface InvoicePayment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  notes?: string;
  expenseId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  invoiceId: number;
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface PaymentHistoryResponse {
  invoice: {
    id: number;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  };
  payments: InvoicePayment[];
}

export const registerInvoicePayment = async (data: CreatePaymentData) => {
  const response = await api.post('/invoices/payments', data);
  return response.data;
};

export const getPaymentHistory = async (invoiceId: number): Promise<PaymentHistoryResponse> => {
  const response = await api.get(`/invoices/${invoiceId}/payments`);
  return response.data;
};
