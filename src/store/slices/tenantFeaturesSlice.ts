// src/store/slices/tenantFeaturesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Feature {
  code: string;
  name: string;
  module: string;
  configuration?: any;
}

export interface CustomField {
  id: number;
  name: string;
  label: string;
  type: string;
  options?: any;
  required?: boolean;
}

interface TenantFeaturesState {
  features: Feature[];
  customFieldsByModule: Record<string, CustomField[]>;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: TenantFeaturesState = {
  features: [],
  customFieldsByModule: {},
  loading: false,
  error: null,
  initialized: false,
};

// Thunk para obtener features del tenant
export const fetchTenantFeatures = createAsyncThunk(
  'tenantFeatures/fetchFeatures',
  async (tenantId: number) => {
    const response = await api.get(`/features/tenant/${tenantId}/summary`);
    return response.data;
  }
);

// Thunk para verificar si tiene un feature
export const checkFeature = createAsyncThunk(
  'tenantFeatures/checkFeature',
  async ({ tenantId, featureCode }: { tenantId: number; featureCode: string }) => {
    const response = await api.get(`/features/tenant/${tenantId}/has/${featureCode}`);
    return { featureCode, hasFeature: response.data.hasFeature };
  }
);

const tenantFeaturesSlice = createSlice({
  name: 'tenantFeatures',
  initialState,
  reducers: {
    resetFeatures: (state) => {
      state.features = [];
      state.customFieldsByModule = {};
      state.initialized = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTenantFeatures
      .addCase(fetchTenantFeatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantFeatures.fulfilled, (state, action) => {
        state.loading = false;
        
        // Log para debugging
        console.log('[TenantFeatures] Respuesta completa:', action.payload);
        
        // La respuesta viene envuelta en { success, data }
        const data = action.payload.data || action.payload;
        
        state.features = data.features || [];
        // Usar customFieldsByModule como prioridad, fallback a customFields
        state.customFieldsByModule = data.customFieldsByModule || data.customFields || {};
        state.initialized = true;
        
        // Log de custom fields por módulo
        console.log('[TenantFeatures] Custom fields por módulo cargados:', state.customFieldsByModule);
        if (Object.keys(state.customFieldsByModule).length > 0) {
          console.log('[TenantFeatures] ✅ Módulos con custom fields:', Object.keys(state.customFieldsByModule));
        } else {
          console.warn('[TenantFeatures] ⚠️ NO se encontraron custom fields');
        }
      })
      .addCase(fetchTenantFeatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar features';
        state.initialized = true; // Marcar como inicializado incluso en error
        
        // Log para debugging
        console.error('[TenantFeatures] Error al cargar features:', action.error);
      })
      // checkFeature
      .addCase(checkFeature.fulfilled, () => {
        // Opcional: guardar en cache el resultado
      });
  },
});

export const { resetFeatures } = tenantFeaturesSlice.actions;
export default tenantFeaturesSlice.reducer;
