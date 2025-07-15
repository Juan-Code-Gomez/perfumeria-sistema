import api from "./api"; // Usa la instancia centralizada de Axios

export const loginService = async (credentials: {
  username: string;
  password: string;
}) => {
  console.log("VITE_API_URL (PROD):", import.meta.env.VITE_API_URL);
  const response = await api.post("/auth/login", credentials);
  return response.data;
};