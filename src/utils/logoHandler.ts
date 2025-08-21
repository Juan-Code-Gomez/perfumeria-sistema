// Función para cargar el logo desde la carpeta public
export const loadLogo = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject('No se pudo crear el contexto del canvas');
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Convertir a base64
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    
    img.onerror = () => {
      reject('No se pudo cargar el logo');
    };
    
    // Intentar cargar el logo desde public/
    img.src = '/logo-milan.png';
  });
};

// Función para obtener el logo o usar el placeholder
export const getLogoOrPlaceholder = async (): Promise<string | null> => {
  try {
    return await loadLogo();
  } catch (error) {
    console.log('Logo no encontrado, usando placeholder');
    return null;
  }
};
