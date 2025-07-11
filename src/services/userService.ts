import api from "./api"; // Tu instancia de Axios

// Obtener lista de usuarios
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const createUser = async (user: any) => {
  const response = await api.post('/users', user);
  return response.data;
};

export const updateUser = async (id: number, data: any) => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

