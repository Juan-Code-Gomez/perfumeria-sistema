// Debug script para verificar configuración en producción
console.log('🔍 Debug Frontend Configuration:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

// Test directo de la API
const testDirectAPI = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('🧪 Testing API directly with URL:', apiUrl);
  
  try {
    // Test 1: Health check
    const healthResponse = await fetch(`${apiUrl}/health`);
    console.log('✅ Health check status:', healthResponse.status);
    
    // Test 2: Login POST request
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('✅ Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('✅ Login response data:', loginData);
    
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
  }
};

// Exponer función globalmente para testing en consola del navegador
(window as any).testDirectAPI = testDirectAPI;

export { testDirectAPI };
