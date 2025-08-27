import api from "./api"; // Tu instancia de Axios

// Obtener lista de usuarios
export const getUsers = async () => {
  const res = await api.get("/users");
  console.log('Users API Response:', res.data); // Debug
  
  // Manejar estructura de respuesta del backend
  const userData = res.data.data || res.data;
  console.log('Processed User Data:', userData); // Debug
  
  // Asegurar que siempre retornemos un array
  return Array.isArray(userData) ? userData : [];
};

export const createUser = async (user: any) => {
  const response = await api.post('/users', user);
  return response.data.data || response.data;
};

export const updateUser = async (id: number, data: any) => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data.data || response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data.data || response.data;
};

