// src/hooks/useFeatures.ts
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useAppDispatch } from '../store';
import { fetchTenantFeatures } from '../store/slices/tenantFeaturesSlice';

/**
 * Hook para acceder a los features del tenant actual
 * 
 * Uso:
 * const { hasFeature, getFeatureConfig, getCustomFields, loading } = useFeatures();
 * 
 * if (hasFeature('JEWELRY_MODULE')) {
 *   // Mostrar componente de joyería
 * }
 * 
 * const customFields = getCustomFields('PRODUCTS');
 */
export const useFeatures = () => {
  const dispatch = useAppDispatch();
  
  const { 
    features, 
    customFieldsByModule, 
    loading, 
    error, 
    initialized 
  } = useSelector((state: RootState) => state.tenantFeatures);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const tenantId = user?.tenantId;

  // Cargar features al montar el componente
  useEffect(() => {
    if (tenantId && !initialized && !loading) {
      dispatch(fetchTenantFeatures(tenantId));
    }
  }, [tenantId, initialized, loading, dispatch]);

  // Verificar si el tenant tiene un feature activado
  const hasFeature = useMemo(() => {
    return (featureCode: string): boolean => {
      return features.some(f => f.code === featureCode);
    };
  }, [features]);

  // Obtener configuración de un feature
  const getFeatureConfig = useMemo(() => {
    return (featureCode: string): any | null => {
      const feature = features.find(f => f.code === featureCode);
      return feature?.configuration || null;
    };
  }, [features]);

  // Obtener campos personalizados de un módulo
  const getCustomFields = useMemo(() => {
    return (module: string) => {
      return customFieldsByModule[module] || [];
    };
  }, [customFieldsByModule]);

  // Verificar si un feature existe (sin importar si está activado)
  const featureExists = useMemo(() => {
    return (featureCode: string): boolean => {
      return features.some(f => f.code === featureCode);
    };
  }, [features]);

  return {
    features,
    hasFeature,
    getFeatureConfig,
    getCustomFields,
    featureExists,
    loading,
    error,
    initialized,
  };
};
