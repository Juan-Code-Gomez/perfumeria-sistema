// src/features/providers/providerSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierService from '../../services/supplierService';
import type { Provider } from './types';

interface ProvidersState {
  items: Provider[];
  loading: boolean;
  error: string | null;
}

const initialState: ProvidersState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProviders = createAsyncThunk(
  'providers/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await supplierService.getSuppliers();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Error al cargar proveedores');
    }
  }
);

export const addProvider = createAsyncThunk(
  'providers/add',
  async (data: Provider, thunkAPI) => {
    try {
      return await supplierService.createSupplier(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Error al crear proveedor');
    }
  }
);

export const updateProvider = createAsyncThunk(
  'providers/update',
  async (data: Provider, thunkAPI) => {
    try {
      return await supplierService.updateSupplier(data.id, data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Error al actualizar proveedor');
    }
  }
);

export const deleteProvider = createAsyncThunk(
  'providers/delete',
  async (id: number, thunkAPI) => {
    try {
      await supplierService.deleteSupplier(id);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Error al eliminar proveedor');
    }
  }
);

const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ADD
      .addCase(addProvider.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // UPDATE
      .addCase(updateProvider.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      // DELETE
      .addCase(deleteProvider.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  }
});

export default providerSlice.reducer;
