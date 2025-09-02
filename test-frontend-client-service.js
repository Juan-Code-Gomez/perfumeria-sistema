// test-frontend-client-service.js
// Script para probar manualmente el servicio de clientes en el navegador
// Ejecutar en la consola del navegador cuando el frontend esté corriendo

console.log('🧪 Prueba manual del servicio de clientes');

// Simular la estructura de respuesta que viene del backend
const mockBackendResponse = {
    success: true,
    data: {
        success: true,
        data: [
            {
                id: 3,
                name: "Juan prueba Gomez",
                phone: "3107317042",
                email: "camilo.go@outlook.com",
                document: null,
                address: null,
                createdAt: "2025-09-02T02:22:36.104Z",
                updatedAt: "2025-09-02T02:22:36.104Z"
            },
            {
                id: 2,
                name: "Juan prueba Gomez",
                phone: "3107317042",
                email: "camilo.go@outlook.com",
                document: null,
                address: "Calle 2c # 70-51",
                createdAt: "2025-08-26T19:45:10.400Z",
                updatedAt: "2025-08-26T19:45:10.400Z"
            },
            {
                id: 1,
                name: "Juan prueba Gomez",
                phone: "3107317042",
                email: "camilo.go@outlook.com",
                document: null,
                address: "Calle 2c # 70-51",
                createdAt: "2025-08-26T19:44:40.166Z",
                updatedAt: "2025-08-26T19:44:40.166Z"
            }
        ],
        timestamp: "2025-09-02T02:22:38.112Z"
    },
    timestamp: "2025-09-02T02:22:38.112Z"
};

// Simular la lógica de extracción actualizada
function extractClientData(response) {
    let responseData = response;
    
    // Si hay una estructura anidada { success: true, data: { success: true, data: [...] } }
    if (responseData?.data?.data) {
        responseData = responseData.data.data;
        console.log('✅ Usando lógica: response.data.data.data');
    }
    // Si hay una estructura simple { success: true, data: [...] }
    else if (responseData?.data) {
        responseData = responseData.data;
        console.log('✅ Usando lógica: response.data.data');
    }
    
    // Asegurar que siempre devuelva un array
    return Array.isArray(responseData) ? responseData : [];
}

const extractedClients = extractClientData(mockBackendResponse);

console.log('📊 Resultado de la extracción:');
console.log('- ¿Es array?:', Array.isArray(extractedClients));
console.log('- Número de clientes:', extractedClients.length);
console.log('- Clientes extraídos:', extractedClients);

if (extractedClients.length > 0) {
    console.log('✅ ¡La extracción funciona correctamente!');
    console.log('👤 Primer cliente:', extractedClients[0]);
} else {
    console.log('❌ La extracción falló - no se obtuvieron clientes');
}

// Instrucciones para usar en el navegador
console.log('\n📋 Para probar en el navegador:');
console.log('1. Abre las DevTools');
console.log('2. Ve a la pestaña Network');
console.log('3. Recarga la página de clientes');
console.log('4. Busca la petición GET /clients');
console.log('5. Verifica que la respuesta tenga la estructura esperada');
console.log('6. Si ves los clientes en la Network tab pero no en la tabla, el problema está en el frontend');
console.log('7. Si no ves clientes en la Network tab, el problema está en el backend');
