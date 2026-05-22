// Diagnóstico: Verificar estado del frontend en Vercel
const axios = require('axios');

async function checkFrontend() {
  const url = 'https://perfumeria-sistema-jcgs-projects.vercel.app';
  
  console.log('🔍 Diagnóstico del Frontend en Vercel\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar index.html
    console.log('\n1️⃣  Verificando index.html...');
    const htmlResponse = await axios.get(url, {
      timeout: 10000,
      headers: { 'Accept': 'text/html' }
    });
    
    if (htmlResponse.data.includes('<div id="root">')) {
      console.log('   ✅ index.html se carga correctamente');
    } else {
      console.log('   ❌ index.html no tiene estructura esperada');
      console.log('   Primera línea:', htmlResponse.data.substring(0, 100));
    }
    
    // 2. Verificar que los archivos JS tienen el MIME type correcto
    console.log('\n2️⃣  Verificando MIME types de archivos JS...');
    const scriptMatch = htmlResponse.data.match(/src="([^"]+\.js)"/);
    
    if (scriptMatch && scriptMatch[1]) {
      const scriptUrl = scriptMatch[1].startsWith('http') 
        ? scriptMatch[1] 
        : `${url}${scriptMatch[1]}`;
      
      try {
        const jsResponse = await axios.get(scriptUrl, {
          timeout: 10000,
          validateStatus: () => true
        });
        
        const contentType = jsResponse.headers['content-type'];
        console.log(`   Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('javascript')) {
          console.log('   ✅ MIME type correcto para archivos JS');
        } else {
          console.log('   ❌ MIME type incorrecto');
          console.log('   Se esperaba: application/javascript');
          console.log(`   Se recibió: ${contentType}`);
        }
      } catch (err) {
        console.log(`   ⚠️  No se pudo verificar archivo JS: ${err.message}`);
      }
    } else {
      console.log('   ⚠️  No se encontró referencia a archivo JS en HTML');
    }
    
    // 3. Verificar estado general
    console.log('\n3️⃣  Estado General:');
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${htmlResponse.status}`);
    console.log(`   Tamaño HTML: ${htmlResponse.data.length} bytes`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnóstico completado');
    console.log('\n💡 Ahora intenta:');
    console.log(`   1. Abrir ${url} en tu navegador`);
    console.log('   2. Presionar Ctrl+Shift+R para limpiar caché');
    console.log('   3. Revisar la consola del navegador');
    
  } catch (error) {
    console.error('\n❌ Error en diagnóstico:');
    if (error.code === 'ECONNABORTED') {
      console.error('   Timeout - El servidor no respondió a tiempo');
    } else if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   ${error.response.statusText}`);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

checkFrontend();
