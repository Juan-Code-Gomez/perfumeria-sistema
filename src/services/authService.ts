import api from "./api"; // Usa la instancia centralizada de Axios

export const loginService = async (credentials: {
  username: string;
  password: string;
}) => {
  console.log("VITE_API_URL (PROD):", import.meta.env.VITE_API_URL);
  console.log("Credenciales enviadas:", credentials);
  
  try {
    const response = await api.post("/auth/login", credentials);
    console.log("Respuesta completa del backend:", response);
    console.log("response.data:", response.data);
    
    // El backend devuelve { success: true, data: { user, token } }
    // Pero necesitamos devolver solo { user, token }
    if (response.data.success && response.data.data) {
      console.log("response.data.data.user:", response.data.data.user);
      console.log("response.data.data.token:", response.data.data.token);
      return response.data.data; // Devolver solo los datos
    } else {
      throw new Error("Respuesta del servidor inválida");
    }
  } catch (error) {
    console.error("Error en loginService:", error);
    throw error;
  }
};