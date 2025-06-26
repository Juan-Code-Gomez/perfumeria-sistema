import axios from 'axios'
import type { SaleData } from '../types/SaleTypes'
const API_URL = `${import.meta.env.VITE_API_URL}/sales`



// Obtener todas las ventas
export const getSales = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

export const createSale = async (saleData: SaleData) => {
  const response = await axios.post(API_URL, saleData)
  return response.data
}

// Registrar una venta
export const registerSale = async (saleData: SaleData) => {
  const response = await axios.post(API_URL, saleData)
  return response.data
}

// Eliminar una venta
export const deleteSale = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`)
  return response.data
}

// Actualizar una venta
export const updateSale = async (id: number, saleData: SaleData) => {
  const response = await axios.put(`${API_URL}/${id}`, saleData)
  return response.data
}

// Obtener una venta por ID
export const getSaleById = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`)
  return response.data
}
