import api from "./api";

export const createClient = async (data: {
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
}) => {
  const res = await api.post("/clients", data);
  return res.data;
};

export const findClients = async (name = "") => {
  const res = await api.get("/clients", { params: { name } });
  return res.data;
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
  return res.data;
};
