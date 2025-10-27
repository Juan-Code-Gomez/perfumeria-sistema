// src/services/invoiceService.ts
import api from './api';

export interface InvoiceItem {
  id?: number;
  productId: number;
  quantity: number;
  unitCost: number;
  description?: string;
  batchNumber?: string;
  expiryDate?: string;
  totalPrice?: number;
  affectInventory?: boolean; // Control individual de inventario por item
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  description?: string;
  notes?: string;
  invoiceDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  supplierId?: number;
  inventoryProcessed?: boolean;
  InvoiceItem?: InvoiceItem[];
  Supplier?: {
    id: number;
    name: string;
  };
}

export interface InvoiceSummary {
  total: {
    count: number;
    amount: number;
    paid: number;
    pending: number;
  };
  pending: {
    count: number;
    amount: number;
    paid: number;
    pending: number;
  };
  overdue: {
    count: number;
    amount: number;
    paid: number;
    pending: number;
  };
}

export interface CreateInvoiceData {
  invoiceNumber: string;
  supplierId: number;
  discount?: number;
  notes?: string;
  processInventory?: boolean;
  items: InvoiceItem[];
}

// Interfaz para la respuesta envuelta del backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface UpdateInvoiceData {
  invoiceNumber?: string;
  supplierName?: string;
  amount?: number;
  paidAmount?: number;
  status?: string;
  description?: string;
  invoiceDate?: string;
  dueDate?: string;
}

export interface PayInvoiceData {
  amount: number;
  description?: string;
}

export const getInvoices = async (filters?: { status?: string; overdue?: boolean }): Promise<Invoice[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.overdue) params.append('overdue', 'true');
  
  const response = await api.get<ApiResponse<Invoice[]>>(`/invoices?${params.toString()}`);
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Invoice[];
};

export const getInvoiceSummary = async (): Promise<InvoiceSummary> => {
  const response = await api.get<ApiResponse<InvoiceSummary>>('/invoices/summary');
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as InvoiceSummary;
};

export const getInvoice = async (id: number): Promise<Invoice> => {
  const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Invoice;
};

export const createInvoice = async (data: CreateInvoiceData): Promise<Invoice> => {
  const response = await api.post<ApiResponse<Invoice>>('/invoices', data);
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Invoice;
};

export const updateInvoice = async (id: number, data: UpdateInvoiceData): Promise<Invoice> => {
  const response = await api.patch<ApiResponse<Invoice>>(`/invoices/${id}`, data);
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Invoice;
};

export const payInvoice = async (id: number, data: PayInvoiceData): Promise<Invoice> => {
  const response = await api.post<ApiResponse<Invoice>>(`/invoices/${id}/pay`, data);
  // Si la respuesta tiene el wrapper, extraer data, sino usar directamente
  if (response.data && 'data' in response.data) {
    return response.data.data;
  }
  return response.data as Invoice;
};

export const deleteInvoice = async (id: number): Promise<void> => {
  await api.delete(`/invoices/${id}`);
};
