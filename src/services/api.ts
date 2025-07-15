import axios from 'axios';
console.log("VITE_API_URL (PROD):", import.meta.env.VITE_API_URL);
// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar el token automáticamente a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas (opcional pero útil)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si recibimos 401, podríamos limpiar el token y redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Opcional: dispatch logout action o redirigir
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;