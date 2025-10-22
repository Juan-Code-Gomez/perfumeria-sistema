// src/hooks/usePOSConfiguration.ts
import { useState, useEffect } from 'react';
import systemParametersService from '../services/systemParametersService';
import type { PosConfiguration } from '../services/systemParametersService';

interface UsePOSConfigurationReturn {
  config: PosConfiguration;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePOSConfiguration = (companyId?: number): UsePOSConfigurationReturn => {
  const [config, setConfig] = useState<PosConfiguration>({
    editCostEnabled: false,
    showProfitMargin: true,
    requireCustomer: false,
    negativeStockAllowed: false,
    allowManualSaleDate: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      const configuration = await systemParametersService.getPosConfiguration(companyId);
      setConfig(configuration);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al cargar configuración del POS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguration();
  }, [companyId]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfiguration,
  };
};