import axios from "axios";
import type { Sale } from "../types/SaleTypes";

const API_URL = `${import.meta.env.VITE_API_URL}/sales`;

export async function getSales (params?: { dateFrom?: string; dateTo?: string }){
  const res = await axios.get(API_URL, { params });
  return res.data;
};

export const createSale = async (data: Sale) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};
