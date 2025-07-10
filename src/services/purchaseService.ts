// src/services/purchaseService.ts
import api from "./api";

export const getPurchases = async (filters?: any) => {
  const response = await api.get("/purchases", { params: filters });
  return response.data;
};

export const createPurchase = async (purchaseData: any) => {
  const response = await api.post("/purchases", purchaseData);
  return response.data;
};


