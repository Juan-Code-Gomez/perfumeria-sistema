import axios from "axios";
import type { Sale, CreateSalePayload } from "../types/SaleTypes";

const API_URL = `${import.meta.env.VITE_API_URL}/sales`;

export async function getSales(params?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const res = await axios.get(API_URL, { params });
  return res.data;
}

export const createSale = async (data: CreateSalePayload) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export async function getPendingSales() {
  const res = await axios.get(`${API_URL}/pending`);
  return res.data;
}

// Obtener pagos de una venta
export async function getSalePayments(saleId: number) {
  const res = await axios.get(`${API_URL}/${saleId}/payments`);
  return res.data;
}

// Registrar un abono/pago
export async function createSalePayment(
  saleId: number,
  data: { amount: number; date: string; method?: string; note?: string }
) {
  const res = await axios.post(`${API_URL}/${saleId}/payments`, data);
  return res.data;
}