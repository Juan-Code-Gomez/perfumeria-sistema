// src/services/systemParametersService.ts
import api from './api';

export interface SystemParameter {
  id: number;
  parameterKey: string;
  parameterValue: boolean;
  parameterType: string;
  stringValue?: string;
  numberValue?: number;
  jsonValue?: any;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PosConfiguration {
  editCostEnabled: boolean;
  showProfitMargin: boolean;
  requireCustomer: boolean;
  negativeStockAllowed: boolean;
}

class SystemParametersService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // Obtener configuración completa del POS
  async getPosConfiguration(companyId?: number): Promise<PosConfiguration> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get('/system-parameters/pos/configuration', { params });
      console.log('POS Configuration response:', response.data); // Debug
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error al obtener configuración del POS:', error);
      // Configuración por defecto en caso de error
      return {
        editCostEnabled: false,
        showProfitMargin: true,
        requireCustomer: false,
        negativeStockAllowed: false,
      };
    }
  }

  // Verificar si edición de costo está habilitada
  async isPosEditCostEnabled(companyId?: number): Promise<boolean> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get('/system-parameters/pos/edit-cost-enabled', { params });
      return response.data.enabled;
    } catch (error) {
      console.error('Error al verificar si edición de costo está habilitada:', error);
      return false; // Por defecto deshabilitado
    }
  }

  // Verificar si margen de ganancia está visible
  async isProfitMarginVisible(companyId?: number): Promise<boolean> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get('/system-parameters/pos/profit-margin-visible', { params });
      return response.data.visible;
    } catch (error) {
      console.error('Error al verificar si margen de ganancia está visible:', error);
      return true; // Por defecto visible
    }
  }

  // Obtener un parámetro específico con cache
  async getParameter(key: string, companyId?: number): Promise<any> {
    const cacheKey = `${key}_${companyId || 'global'}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey);
      if (expiry && expiry > Date.now()) {
        return this.cache.get(cacheKey);
      }
    }

    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get(`/system-parameters/key/${key}`, { params });
      const value = response.data.value;

      // Actualizar cache
      this.cache.set(cacheKey, value);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      return value;
    } catch (error) {
      console.error(`Error al obtener parámetro ${key}:`, error);
      return null;
    }
  }

  // Obtener parámetros por categoría
  async getParametersByCategory(category: string, companyId?: number): Promise<SystemParameter[]> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get(`/system-parameters/category/${category}`, { params });
      const nestedData = response.data?.data?.data || response.data?.data || response.data || [];
      return Array.isArray(nestedData) ? nestedData : [];
    } catch (error) {
      console.error(`Error al obtener parámetros de categoría ${category}:`, error);
      throw error;
    }
  }

  // Actualizar un parámetro
  async updateParameter(key: string, data: Partial<SystemParameter>, companyId?: number): Promise<SystemParameter> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.put(`/system-parameters/${key}`, data, { params });
      
      // Limpiar cache
      this.clearCache(key, companyId);
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error al actualizar parámetro ${key}:`, error);
      throw error;
    }
  }

  // Obtener todos los parámetros
  async getAllParameters(companyId?: number): Promise<SystemParameter[]> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get('/system-parameters', { params });
      
      // Manejar la estructura anidada de la respuesta: response.data.data.data
      const nestedData = response.data?.data?.data || response.data?.data || response.data || [];
      return Array.isArray(nestedData) ? nestedData : [];
    } catch (error) {
      console.error('Error al obtener parámetros del sistema:', error);
      // Retornar array vacío en lugar de lanzar error para evitar crashes
      return [];
    }
  }

  // Inicializar parámetros por defecto (solo para administradores)
  async initializeParameters(): Promise<any> {
    try {
      const response = await api.post('/system-parameters/initialize');
      return response.data;
    } catch (error) {
      console.error('Error al inicializar parámetros:', error);
      throw error;
    }
  }

  // Métodos de conveniencia para tipos específicos
  async getBooleanParameter(key: string, companyId?: number, defaultValue = false): Promise<boolean> {
    const value = await this.getParameter(key, companyId);
    return value !== null ? Boolean(value) : defaultValue;
  }

  async getStringParameter(key: string, companyId?: number, defaultValue = ''): Promise<string> {
    const value = await this.getParameter(key, companyId);
    return value !== null ? String(value) : defaultValue;
  }

  async getNumberParameter(key: string, companyId?: number, defaultValue = 0): Promise<number> {
    const value = await this.getParameter(key, companyId);
    return value !== null ? Number(value) : defaultValue;
  }

  // Limpiar cache específico
  private clearCache(key: string, companyId?: number): void {
    const cacheKey = `${key}_${companyId || 'global'}`;
    this.cache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }

  // Limpiar todo el cache
  clearAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Limpiar cache del POS específicamente
  clearPosCache(): void {
    const keys = Array.from(this.cache.keys()).filter(key => 
      key.includes('pos_edit_cost_enabled') || 
      key.includes('pos_show_profit_margin')
    );
    keys.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }
}

// Instancia singleton
const systemParametersService = new SystemParametersService();

export default systemParametersService;