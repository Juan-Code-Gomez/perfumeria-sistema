// src/features/company-config/companyConfigSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyConfigService } from '../../services/companyConfigService';

export interface CompanyConfig {
  id: number;
  companyName: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  invoicePrefix?: string;
  invoiceFooter?: string;
  taxRate?: number;
  currency: string;
  posReceiptHeader?: string;
  posReceiptFooter?: string;
  printLogo: boolean;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyConfigData {
  companyName: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  invoicePrefix?: string;
  invoiceFooter?: string;
  taxRate?: number;
  currency?: string;
  posReceiptHeader?: string;
  posReceiptFooter?: string;
  printLogo?: boolean;
  timezone?: string;
  dateFormat?: string;
  numberFormat?: string;
}

interface CompanyConfigState {
  config: CompanyConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyConfigState = {
  config: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCompanyConfig = createAsyncThunk<CompanyConfig, void, { rejectValue: string }>(
  'companyConfig/fetch',
  async (_, thunkAPI) => {
    try {
      const response = await companyConfigService.getCurrent();
      return response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? 'Error al cargar configuración');
    }
  }
);

export const fetchPublicCompanyConfig = createAsyncThunk<
  { companyName: string; logo?: string },
  void,
  { rejectValue: string }
>(
  'companyConfig/fetchPublic',
  async (_, thunkAPI) => {
    try {
      const response = await companyConfigService.getPublicConfig();
      return response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? 'Error al cargar configuración pública');
    }
  }
);

export const updateCompanyConfig = createAsyncThunk<
  CompanyConfig,
  CreateCompanyConfigData,
  { rejectValue: string }
>(
  'companyConfig/update',
  async (data, thunkAPI) => {
    try {
      const response = await companyConfigService.updateCurrent(data);
      return response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? 'Error al actualizar configuración');
    }
  }
);

export const getInvoiceConfig = createAsyncThunk<any, void, { rejectValue: string }>(
  'companyConfig/getInvoiceConfig',
  async (_, thunkAPI) => {
    try {
      const response = await companyConfigService.getInvoiceConfig();
      return response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? 'Error al cargar configuración de facturación');
    }
  }
);

export const getPOSConfig = createAsyncThunk<any, void, { rejectValue: string }>(
  'companyConfig/getPOSConfig',
  async (_, thunkAPI) => {
    try {
      const response = await companyConfigService.getPOSConfig();
      return response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? 'Error al cargar configuración POS');
    }
  }
);

const companyConfigSlice = createSlice({
  name: 'companyConfig',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch company config
      .addCase(fetchCompanyConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchCompanyConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar configuración';
      })
      // Fetch public company config
      .addCase(fetchPublicCompanyConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicCompanyConfig.fulfilled, (state, action) => {
        state.loading = false;
        // Actualizar solo los campos disponibles en la configuración pública
        if (state.config) {
          state.config.companyName = action.payload.companyName;
          state.config.logo = action.payload.logo;
        } else {
          // Crear una configuración básica si no existe
          state.config = {
            id: 0,
            companyName: action.payload.companyName,
            logo: action.payload.logo,
            currency: 'COP',
            printLogo: false,
            timezone: 'America/Bogota',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: 'es-CO',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as CompanyConfig;
        }
      })
      .addCase(fetchPublicCompanyConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar configuración pública';
      })
      // Update company config
      .addCase(updateCompanyConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(updateCompanyConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al actualizar configuración';
      });
  },
});

export const { clearError } = companyConfigSlice.actions;
export default companyConfigSlice.reducer;
