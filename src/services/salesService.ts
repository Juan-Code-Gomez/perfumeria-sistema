import api from "./api";
import type { CreateSalePayload, ProfitabilityStats } from "../types/SaleTypes";

export async function getSales(params?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const res = await api.get("/sales", { params });
  return res.data.data || res.data; // Extrae la data del wrapper si existe
}

// Obtener una venta por ID
export async function getSaleById(saleId: number) {
  const res = await api.get(`/sales/${saleId}`);
  return res.data.data || res.data; // Extrae la data del wrapper si existe
}

export const createSale = async (data: CreateSalePayload) => {
  const res = await api.post("/sales", data);
  return res.data.data || res.data; // Extrae la data del wrapper si existe
};

export async function getPendingSales() {
  const res = await api.get("/sales/pending");
  return res.data.data || res.data; // Extrae la data del wrapper si existe
}

// Obtener pagos de una venta
export async function getSalePayments(saleId: number) {
  const res = await api.get(`/sales/${saleId}/payments`);
  return res.data.data || res.data; // Extrae la data del wrapper si existe
}

// Registrar un abono/pago
export async function createSalePayment(
  saleId: number,
  data: { amount: number; date: string; method?: string; note?: string }
) {
  const res = await api.post(`/sales/${saleId}/payments`, data);
  return res.data.data || res.data; // Extrae la data del wrapper si existe
}

export async function createCreditNote(data: {
  saleId: number;
  details: { productId: number; quantity: number }[];
}) {
  const res = await api.post("/sales/credit-notes", data);
  return res.data.data || res.data; // Extrae la data del wrapper si existe
}

// Obtener estadísticas de rentabilidad
export async function getProfitabilityStats(params?: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ success: boolean; data: ProfitabilityStats }> {
  const res = await api.get("/sales/analytics/profitability", { params });
  return res.data;
}

// Eliminar una venta (solo ADMIN y SUPER_ADMIN)
export async function deleteSale(saleId: number) {
  const res = await api.delete(`/sales/${saleId}`);
  return res.data;
}
