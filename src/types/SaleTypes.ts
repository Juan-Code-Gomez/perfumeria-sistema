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
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  details: SaleDetail[];
}