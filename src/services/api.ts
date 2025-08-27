import axios from 'axios';

// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

console.log("api", api);

// Interceptor para debug de requests
api.interceptors.request.use(
  (config) => {
    console.log("🚀 Axios Request Interceptor:");
    console.log("🚀 Method:", config.method);
    console.log("🚀 URL:", config.url);
    console.log("🚀 Full URL:", (config.baseURL || '') + (config.url || ''));
    console.log("🚀 Data:", config.data);
    
    const token = localStorage.getItem('token');
    console.log("🔑 Token desde localStorage:", token ? `${token.substring(0, 50)}...` : 'NO EXISTE');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token agregado al header Authorization");
    } else {
      console.log("❌ NO se agregó token - no existe en localStorage");
    }
    
    console.log("🚀 Headers finales:", config.headers);
    return config;
  },
  (error) => {
    console.error("🚀 Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para debug de responses
api.interceptors.response.use(
  (response) => {
    console.log("✅ Axios Response Interceptor:");
    console.log("✅ Status:", response.status);
    console.log("✅ Data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Axios Response Error Interceptor:");
    console.error("❌ Status:", error.response?.status);
    console.error("❌ Data:", error.response?.data);
    console.error("❌ Config:", error.config);
    
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