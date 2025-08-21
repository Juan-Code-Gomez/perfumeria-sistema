export interface SaleDetail {
  id?: number;
  productId: number;
  product?: { id: number; name: string };
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  purchasePrice?: number;  // Precio de compra al momento de la venta
  profitAmount?: number;   // Ganancia real
  profitMargin?: number;   // Margen % real
  suggestedPrice?: number; // Precio sugerido original
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
    purchasePrice?: number;  // Opcional - se obtendrá del producto si no se proporciona
    suggestedPrice?: number; // Opcional - precio sugerido original
  }>;
}

export interface ProfitabilityStats {
  period: {
    from: string;
    to: string;
  };
  totals: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    overallMargin: number;
    totalItems: number;
    salesCount: number;
  };
  topProfitableProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
    cost: number;
    profit: number;
    avgMargin: number;
    salesCount: number;
  }>;
  dailyProfits: Array<{
    date: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
}
