import api from "./api";

export const getProducts = async (filters?: {
  name?: string;
  categoryId?: number;
  unitId?: number;
  onlyLowStock?: boolean;
  salePriceMin?: number;
  salePriceMax?: number;
  page?: number;
  pageSize?: number;
}) => {
  const response = await api.get("/products", { params: filters });
  return response.data;
};

export const createProduct = async (product: any) => {
  const response = await api.post("/products", product);
  return response.data;
};

export const updateProduct = async (id: number, product: any) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await api.get("/products/alerts/low-stock");
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

export const bulkUploadProducts = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/products/bulk-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
