import api from "./api"; // Usa la instancia centralizada de Axios

export const loginService = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};