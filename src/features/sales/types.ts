export interface SaleDetail {
  id: number;
  saleId: number;
  productId: number;
  product: {
    purchasePrice: number; id: number; name: string 
};
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: number;
  date: string;
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  details: SaleDetail[];
}