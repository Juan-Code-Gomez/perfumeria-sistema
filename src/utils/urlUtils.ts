// src/utils/urlUtils.ts

/**
 * Construye la URL para un logo de empresa (ahora desde el frontend)
 * Los logos se guardan en public/logos/ y se acceden directamente
 */
export const getCompanyLogoUrl = (logoPath?: string): string | null => {
  if (!logoPath) return null;
  
  // Debug: imprimir valores para diagnóstico
  console.log('Logo path from backend:', logoPath);
  
  // Los archivos en public/ se sirven directamente desde la raíz
  // logoPath viene como "/logos/filename.jpg"
  const result = logoPath;
  console.log('Final logo URL:', result);
  
  return result;
};