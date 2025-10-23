// src/services/productBatchService.ts
import api from './api';

export interface ProductBatch {
  id: number;
  productId: number;
  purchaseId: number | null;
  quantity: number;
  remainingQty: number;
  unitCost: number;
  purchaseDate: string;
  expiryDate: string | null;
  batchNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    sku: string | null;
    salePrice: number;
  };
  purchase?: {
    id: number;
    date: string;
    supplier: {
      id: number;
      name: string;
    };
  };
}

export interface BatchSummary {
  totalBatches: number;
  totalQuantity: number;
  totalRemaining: number;
  totalValue: number;
  averageCost: number;
}

export interface ProductBatchesResponse {
  batches: ProductBatch[];
  summary: BatchSummary;
}

export interface InventoryValuation {
  productId: number;
  productName: string;
  productSku: string | null;
  totalQuantity: number;
  totalValue: number;
  averageCost: number;
}

export interface ExpiringBatch {
  id: number;
  productId: number;
  productName: string;
  productSku: string | null;
  quantity: number;
  remainingQty: number;
  unitCost: number;
  expiryDate: string;
  daysUntilExpiry: number;
  potentialLoss: number;
  batchNumber: string | null;
}

const productBatchService = {
  // Obtener todos los lotes de un producto específico
  getBatchesByProduct: async (productId: number): Promise<ProductBatchesResponse> => {
    const response = await api.get(`/product-batches/product/${productId}`);
    return response.data.data;
  },

  // Obtener valorización total del inventario
  getInventoryValuation: async (): Promise<InventoryValuation[]> => {
    const response = await api.get('/product-batches/valuation');
    return response.data.data;
  },

  // Obtener lotes próximos a vencer
  getExpiringBatches: async (days: number = 30): Promise<ExpiringBatch[]> => {
    const response = await api.get('/product-batches/expiring', {
      params: { days }
    });
    return response.data.data;
  },

  // Obtener lotes ya vencidos
  getExpiredBatches: async (): Promise<ExpiringBatch[]> => {
    const response = await api.get('/product-batches/expired');
    return response.data.data;
  },
};

export default productBatchService;
