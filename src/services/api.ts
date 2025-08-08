import axios from 'axios';

// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 segundos de timeout
});

console.log("api", api);

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
    // Si recibimos 401, limpiar el token pero NO redirigir automáticamente
    // para evitar bucles infinitos
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Nota: El componente PrivateRoute se encargará de redirigir al login
      // NO usar window.location.href para evitar bucles
    }
    return Promise.reject(error);
  }
);

export default api;