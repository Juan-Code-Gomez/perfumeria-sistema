export interface SaleDetail {
  id: number;
  saleId: number;
  productId: number;
  product: {
    id: number; 
    name: string;
    purchasePrice: number;
  };
  quantity: number;
  unitPrice: number;      // Precio de venta real (variable)
  totalPrice: number;     // unitPrice * quantity
  purchasePrice: number;  // Precio de compra al momento de la venta
  profitAmount: number;   // Ganancia real = unitPrice - purchasePrice
  profitMargin: number;   // Margen % real
  suggestedPrice?: number; // Precio sugerido original
}

export interface SalePayment {
  id: number;
  saleId: number;
  amount: number;
  method: string;
  note?: string;
  date: string;
}

export interface CreateSalePayment {
  amount: number;
  method: string;
  note?: string;
}

export interface Sale {
  id: number;
  date: string;
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
  paymentMethod?: string; // Para compatibilidad hacia atrás
  details: SaleDetail[];
  payments?: SalePayment[]; // Múltiples métodos de pago
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