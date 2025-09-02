import api from "./api";

export const createClient = async (data: {
  name: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
}) => {
  const res = await api.post("/clients", data);
  
  // Manejar respuesta anidada del backend
  let responseData = res.data;
  
  // Si hay una estructura anidada { success: true, data: { success: true, data: cliente } }
  if (responseData?.data?.data) {
    responseData = responseData.data.data;
  }
  // Si hay una estructura simple { success: true, data: cliente }
  else if (responseData?.data) {
    responseData = responseData.data;
  }
  
  return responseData;
};

export const findClients = async (name = "") => {
  const res = await api.get("/clients", { params: { name } });
  
  // Manejar respuesta anidada del backend
  let responseData = res.data;
  
  // Si hay una estructura anidada { success: true, data: { success: true, data: [...] } }
  if (responseData?.data?.data) {
    responseData = responseData.data.data;
  }
  // Si hay una estructura simple { success: true, data: [...] }
  else if (responseData?.data) {
    responseData = responseData.data;
  }
  
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
  
  // Manejar respuesta anidada del backend
  let responseData = res.data;
  
  // Si hay una estructura anidada { success: true, data: { success: true, data: cliente } }
  if (responseData?.data?.data) {
    responseData = responseData.data.data;
  }
  // Si hay una estructura simple { success: true, data: cliente }
  else if (responseData?.data) {
    responseData = responseData.data;
  }
  
  return responseData;
};
