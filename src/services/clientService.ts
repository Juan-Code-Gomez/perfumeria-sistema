import api from "./api";

export const createClient = async (data: {
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
}) => {
  const res = await api.post("/clients", data);
  // Si el backend devuelve { success: true, data: cliente }
  return res.data.data || res.data;
};

export const findClients = async (name = "") => {
  const res = await api.get("/clients", { params: { name } });
  // Manejar respuesta estructurada del backend
  const responseData = res.data.data || res.data;
  // Asegurar que siempre devuelva un array
  return Array.isArray(responseData) ? responseData : [];
};

export const deleteClient = async (id: number) => {
  await api.delete(`/clients/${id}`);
  return id;
};

export const updateClient = async (
  id: number,
  data: {
    name: string;
    phone?: string;
    email?: string;
    document?: string;
    address?: string;
  }
) => {
  const res = await api.put(`/clients/${id}`, data);
  // Si el backend devuelve { success: true, data: cliente }
  return res.data.data || res.data;
};
