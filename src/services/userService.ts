import api from "./api"; // Tu instancia de Axios

// Obtener lista de usuarios
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

// (Más adelante: createUser, updateUser, deleteUser, etc.)
