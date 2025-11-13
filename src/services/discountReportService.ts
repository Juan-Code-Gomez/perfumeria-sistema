import api from './api';

export interface DiscountReportSummary {
  totalSales: number;
  totalDiscountAmount: number;
  totalSubtotalAmount: number;
  totalFinalAmount: number;
  averageDiscountAmount: number;
  discountPercentageOfSubtotal: number;
}

export interface DiscountByType {
  [key: string]: {
    count: number;
    totalDiscountAmount: number;
    totalSubtotal: number;
  };
}

export interface TopCustomer {
  name: string;
  totalDiscount: number;
  salesCount: number;
}

export interface SaleWithDiscount {
  id: number;
  date: string;
  customerName: string | null;
  subtotalAmount: number;
  discountType: string | null;
  discountValue: number | null;
  discountAmount: number;
  totalAmount: number;
  customerDisplayName: string;
  client?: {
    id: number;
    name: string;
  };
}

export interface DiscountReport {
  summary: DiscountReportSummary;
  discountsByType: DiscountByType;
  topCustomers: TopCustomer[];
  salesWithDiscounts: SaleWithDiscount[];
  period: {
    from: string | null;
    to: string | null;
  };
}

export async function getDiscountsReport(params?: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ success: boolean; data: DiscountReport }> {
  const response = await api.get('/sales/analytics/discounts', { params });
  
  // Manejar la doble anidación de la respuesta del backend
  if (response.data?.data?.data) {
    return {
      success: response.data.success,
      data: response.data.data.data
    };
  }
  
  // Fallback para respuesta normal
  return response.data?.data || response.data;
}