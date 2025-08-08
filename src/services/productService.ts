import api from "./api";

// Tipos base del producto
export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  fragranceName?: string;
  categoryId: number;
  unitId: number;
  productType: 'SIMPLE' | 'VARIANT' | 'COMPOSITE';
  size?: string;
  sizeValue?: number;
  brand?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'UNISEX';
  hasVariants: boolean;
  parentProductId?: number;
  variantType?: string;
  isComposite: boolean;
  requiresPreparation: boolean;
  stock: number;
  minStock?: number;
  purchasePrice: number;
  salePrice: number;
  suggestedPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  supplierId?: number;
  supplierCode?: string;
  imageUrl?: string;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  unit?: { id: number; name: string };
  supplier?: { id: number; name: string };
}

export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  averagePrice: number;
  productsByCategory: Array<{
    categoryName: string;
    count: number;
  }>;
  productsByBrand: Array<{
    brand: string;
    count: number;
  }>;
  recentProducts: Product[];
}

export interface FinancialStatistics {
  totalInventoryValue: number;
  totalPurchaseValue: number;
  totalSaleValue: number;
  averageMargin: number;
  productCount: number;
  lowStockValue: number;
  outOfStockCount: number;
  profitabilityByCategory: Array<{
    categoryName: string;
    margin: number;
    inventoryValue: number;
  }>;
}

export const getProducts = async (filters?: {
  name?: string;
  categoryId?: number;
  unitId?: number;
  onlyLowStock?: boolean;
  salePriceMin?: number;
  salePriceMax?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  productType?: string;
  brand?: string;
  gender?: string;
  isActive?: boolean;
}) => {
  const response = await api.get("/products", { params: filters });
  return response.data;
};

export const searchProducts = async (query: string) => {
  const response = await api.get("/products/search", { params: { q: query } });
  return response.data;
};

export const getProductStatistics = async (): Promise<ProductStatistics> => {
  const response = await api.get("/products/statistics");
  return response.data;
};

export const getFinancialStatistics = async (): Promise<FinancialStatistics> => {
  const response = await api.get("/products/financial-statistics");
  return response.data;
};

export const getInventoryValue = async () => {
  const response = await api.get("/products/inventory-value");
  return response.data;
};

export const getFragranceGroups = async () => {
  const response = await api.get("/products/fragrance-groups");
  return response.data;
};

export const getProductsByFragrance = async (fragranceName: string) => {
  const response = await api.get(`/products/fragrance/${fragranceName}`);
  return response.data;
};

export const getProductsBySupplier = async (supplierId: number) => {
  const response = await api.get(`/products/supplier/${supplierId}`);
  return response.data;
};

export const createProduct = async (product: Partial<Product>) => {
  const response = await api.post("/products", product);
  return response.data;
};

export const createBulkProducts = async (products: Partial<Product>[]) => {
  const response = await api.post("/products/bulk", { products });
  return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>) => {
  const response = await api.patch(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};

export const toggleProductStatus = async (id: number) => {
  const response = await api.patch(`/products/${id}/toggle`);
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await api.get("/products/low-stock");
  return response.data;
};

export const getProductMovements = async (id: number) => {
  const response = await api.get(`/products/${id}/movements`);
  return response.data;
};

export const createProductMovement = async (
  id: number,
  movement: {
    type: "IN" | "OUT" | "ADJUST";
    quantity: number;
    price?: number;
    note?: string;
  }
) => {
  const response = await api.post(`/products/${id}/movements`, movement);
  return response.data;
};

export const getProductPriceHistory = async (id: number) => {
  const response = await api.get(`/products/${id}/price-history`);
  return response.data;
};

export const addProductPrice = async (id: number, priceData: {
  purchasePrice?: number;
  salePrice?: number;
  suggestedPrice?: number;
  notes?: string;
}) => {
  const response = await api.post(`/products/${id}/prices`, priceData);
  return response.data;
};

export const createProductVariant = async (id: number, variantData: {
  name: string;
  variantType: string;
  size?: string;
  sizeValue?: number;
  stock: number;
  purchasePrice: number;
  salePrice: number;
}) => {
  const response = await api.post(`/products/${id}/variants`, variantData);
  return response.data;
};

export const getCompositeProductPrice = async (id: number) => {
  const response = await api.get(`/products/${id}/composite-price`);
  return response.data;
};

export const updateCompositeStock = async (id: number) => {
  const response = await api.patch(`/products/${id}/update-composite-stock`);
  return response.data;
};

export const uploadExcelProducts = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/products/upload-excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getProductTypes = async () => {
  const response = await api.get("/products/types/product-types");
  return response.data;
};

export const getVariantTypes = async () => {
  const response = await api.get("/products/types/variant-types");
  return response.data;
};

export const bulkUploadProducts = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/products/bulk-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
