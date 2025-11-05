import api from "./api";
import type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  ApproveOrderDto,
  OrderStatistics,
  OrderFilters,
  OrderHistoryEntry,
} from "../types/OrderTypes";

/**
 * Listar todos los pedidos con filtros opcionales
 * - VENDEDOR: Solo ve sus propios pedidos
 * - BODEGA/CAJERO/ADMIN: Ven todos los pedidos
 */
export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  const params: any = {};
  
  if (filters?.status) {
    params.status = filters.status;
  }
  
  if (filters?.dateFrom) {
    params.dateFrom = filters.dateFrom;
  }
  
  if (filters?.dateTo) {
    params.dateTo = filters.dateTo;
  }
  
  const res = await api.get("/orders", { params });
  return res.data.data || res.data;
}

/**
 * Obtener un pedido por ID
 */
export async function getOrderById(id: number): Promise<Order> {
  const res = await api.get(`/orders/${id}`);
  return res.data.data || res.data;
}

/**
 * Crear un nuevo pedido
 * Roles: VENDEDOR, CAJERO, ADMIN, BODEGA
 */
export async function createOrder(data: CreateOrderDto): Promise<Order> {
  const res = await api.post("/orders", data);
  return res.data.data || res.data;
}

/**
 * Editar un pedido pendiente
 * Roles: CAJERO, ADMIN
 */
export async function updateOrder(id: number, data: UpdateOrderDto): Promise<Order> {
  const res = await api.patch(`/orders/${id}`, data);
  return res.data.data || res.data;
}

/**
 * Aprobar pedido y convertir en venta
 * Roles: BODEGA, CAJERO, ADMIN
 */
export async function approveOrder(id: number, data: ApproveOrderDto): Promise<{
  order: Order;
  sale: any;
}> {
  const res = await api.post(`/orders/${id}/approve`, data);
  return res.data.data || res.data;
}

/**
 * Cancelar/eliminar pedido
 * Roles: ADMIN
 */
export async function cancelOrder(id: number): Promise<Order> {
  const res = await api.delete(`/orders/${id}`);
  return res.data.data || res.data;
}

/**
 * Obtener historial de cambios de un pedido
 * Roles: BODEGA, CAJERO, ADMIN
 */
export async function getOrderHistory(id: number): Promise<OrderHistoryEntry[]> {
  const res = await api.get(`/orders/${id}/history`);
  return res.data.data || res.data;
}

/**
 * Obtener estadísticas de pedidos
 * Roles: BODEGA, CAJERO, ADMIN
 */
export async function getOrderStatistics(): Promise<OrderStatistics> {
  const res = await api.get("/orders/statistics");
  return res.data.data || res.data;
}
