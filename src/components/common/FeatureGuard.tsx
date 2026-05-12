// src/components/common/FeatureGuard.tsx
import type { ReactNode } from 'react';
import { useFeatures } from '../../hooks/useFeatures';

interface FeatureGuardProps {
  /**
   * Código del feature requerido para mostrar el contenido
   */
  feature: string;
  
  /**
   * Contenido a mostrar si el feature está activado
   */
  children: ReactNode;
  
  /**
   * Contenido alternativo a mostrar si el feature NO está activado (opcional)
   */
  fallback?: ReactNode;
  
  /**
   * Si es true, muestra el loading mientras se cargan los features
   */
  showLoading?: boolean;
}

/**
 * Componente para proteger contenido basado en feature flags
 * 
 * Uso:
 * <FeatureGuard feature="JEWELRY_MODULE">
 *   <JewelryComponent />
 * </FeatureGuard>
 * 
 * Con fallback:
 * <FeatureGuard feature="JEWELRY_MODULE" fallback={<div>No disponible</div>}>
 *   <JewelryComponent />
 * </FeatureGuard>
 */
export const FeatureGuard = ({ 
  feature, 
  children, 
  fallback = null,
  showLoading = false 
}: FeatureGuardProps) => {
  const { hasFeature, loading, initialized } = useFeatures();

  // Si está cargando y showLoading es true, mostrar indicador
  if (loading && showLoading) {
    return <div>Cargando...</div>;
  }

  // Si no está inicializado, no mostrar nada aún
  if (!initialized) {
    return null;
  }

  // Verificar si tiene el feature
  if (!hasFeature(feature)) {
    return <>{fallback}</>;
  }

  // Tiene el feature, mostrar contenido
  return <>{children}</>;
};
