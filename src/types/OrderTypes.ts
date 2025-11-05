// Tipos para el módulo de Pedidos

export const OrderStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface OrderDetail {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  originalQty?: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: number;
    name: string;
    sku?: string;
    stock: number;
    reservedStock: number;
    salePrice: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  customerName?: string;
  clientId?: number;
  notes?: string;
  createdById: number;
  approvedById?: number;
  approvedAt?: string;
  saleId?: number;
  createdAt: string;
  updatedAt: string;
  details: OrderDetail[];
  createdBy?: {
    id: number;
    name: string;
    username: string;
  };
  approvedBy?: {
    id: number;
    name: string;
    username: string;
  };
  client?: {
    id: number;
    name: string;
    phone?: string;
  };
  sale?: {
    id: number;
    totalAmount: number;
    date: string;
  };
  history?: OrderHistoryEntry[];
}

export interface OrderHistoryEntry {
  id: number;
  orderId: number;
  action: 'CREATED' | 'EDITED' | 'APPROVED' | 'CANCELLED';
  userId: number;
  changes?: any; // JSON con detalles de cambios
  notes?: string;
  timestamp: string;
  user?: {
    id: number;
    name: string;
    username: string;
  };
}

export interface OrderStatistics {
  total: number;
  pending: number;
  approved: number;
  cancelled: number;
  pendingOrders: {
    count: number;
    totalAmount: number;
    orders: Order[];
  };
}

// DTOs para crear/actualizar pedidos

export interface CreateOrderDetailDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderDto {
  customerName?: string;
  clientId?: number;
  totalAmount: number;
  notes?: string;
  details: CreateOrderDetailDto[];
}

export interface UpdateOrderDto {
  details?: CreateOrderDetailDto[];
}

export interface PaymentDto {
  method: string;
  amount: string;
  note?: string;
}

export interface ApproveOrderDto {
  payments: PaymentDto[];
}

// Filtros para listar pedidos
export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}
