export interface SaleDetail {
  id?: number;
  productId: number;
  product?: { id: number; name: string };
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Sale {
  id?: number;
  date: string;
  clientId?: number;
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  paymentMethod?: string;
  details: SaleDetail[];
  total: number;
}

export interface CreateSalePayload {
  clientId?: number;
  customerName?: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  paymentMethod: string;
  details: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}
