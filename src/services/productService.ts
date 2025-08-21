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
  search?: string;
  categoryId?: number;
  unitId?: number;
  supplierId?: number;
  stockMin?: number;
  stockMax?: number;
  includeInactive?: boolean;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const response = await api.get("/products", { params: filters });
    console.log('getProducts API response:', response.data);
    // Handle double response wrapper: response.data.data contains the actual data
    const result = response.data?.success ? response.data.data : response.data;
    console.log('getProducts processed result:', result);
    return result;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const searchProducts = async (query: string) => {
  const response = await api.get("/products/search", { params: { q: query } });
  return response.data;
};

export const getProductStatistics = async (): Promise<ProductStatistics> => {
  try {
    const response = await api.get("/products/statistics");
    // Handle double response wrapper
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('Error fetching product statistics:', error);
    throw error;
  }
};

export const getFinancialStatistics = async (): Promise<FinancialStatistics> => {
  try {
    const response = await api.get("/products/financial-statistics");
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('Error fetching financial statistics:', error);
    throw error;
  }
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
  try {
    const response = await api.post("/products", product);
    console.log('createProduct API response:', response.data);
    // Handle double response wrapper: response.data.data contains the actual product
    const result = response.data?.success ? response.data.data : response.data;
    console.log('createProduct processed result:', result);
    return result;
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const createBulkProducts = async (products: Partial<Product>[]) => {
  try {
    const response = await api.post("/products/bulk", { products });
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('Error creating bulk products:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, product: Partial<Product>) => {
  try {
    const response = await api.put(`/products/${id}`, product);
    console.log('updateProduct API response:', response.data);
    const result = response.data?.success ? response.data.data : response.data;
    console.log('updateProduct processed result:', result);
    return result;
  } catch (error: any) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const toggleProductStatus = async (id: number) => {
  const response = await api.patch(`/products/${id}/toggle`);
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await api.get(`/products/${id}`);
    console.log('getProductById API response:', response.data);
    const result = response.data?.success ? response.data.data : response.data;
    console.log('getProductById processed result:', result);
    return result;
  } catch (error: any) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
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

export const bulkUploadProducts = async (file: File, withSupplier: boolean = false) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("withSupplier", withSupplier.toString());

  const response = await api.post("/products/bulk-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const result = response.data?.data || response.data;
  
  // Si hay errores, lanzar excepción con detalles
  if (result.errores && result.errores.length > 0) {
    const errorDetails = result.errores.map((error: any) => 
      error.proveedor ? `Proveedor "${error.proveedor}": ${error.error}` :
      error.fila ? `Fila ${error.fila}: ${error.error}` : 
      error.error
    ).join(', ');
    
    throw new Error(`Errores en la carga: ${errorDetails}`);
  }

  return result;
};

export const exportProductsToExcel = async () => {
  try {
    const response = await api.get("/products/export/excel", {
      responseType: 'blob', // Importante para manejar archivos binarios
    });

    // Crear objeto URL para descargar el archivo
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo de los headers o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = `productos_exportacion_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Archivo exportado exitosamente' };
  } catch (error: any) {
    console.error('Error exporting products:', error);
    throw error;
  }
};
