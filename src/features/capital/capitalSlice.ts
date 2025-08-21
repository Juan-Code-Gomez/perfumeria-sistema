// src/features/capital/capitalSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as capitalService from '../../services/capitalService';
import type { Capital, CapitalSummary, CreateCapitalData, UpdateCapitalData } from '../../services/capitalService';

interface CapitalState {
  items: Capital[];
  summary: CapitalSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: CapitalState = {
  items: [],
  summary: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCapitalHistory = createAsyncThunk(
  'capital/fetchHistory',
  async (_, thunkAPI) => {
    try {
      return await capitalService.getCapitalHistory();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al cargar historial de capital');
    }
  }
);

export const fetchCapitalSummary = createAsyncThunk(
  'capital/fetchSummary',
  async (_, thunkAPI) => {
    try {
      return await capitalService.getCapitalSummary();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al cargar resumen de capital');
    }
  }
);

export const createCapital = createAsyncThunk(
  'capital/create',
  async (data: CreateCapitalData, thunkAPI) => {
    try {
      return await capitalService.createCapital(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al crear registro de capital');
    }
  }
);

export const updateCapital = createAsyncThunk(
  'capital/update',
  async ({ id, data }: { id: number; data: UpdateCapitalData }, thunkAPI) => {
    try {
      return await capitalService.updateCapital(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al actualizar capital');
    }
  }
);

export const deleteCapital = createAsyncThunk(
  'capital/delete',
  async (id: number, thunkAPI) => {
    try {
      await capitalService.deleteCapital(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al eliminar registro');
    }
  }
);

const capitalSlice = createSlice({
  name: 'capital',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch History
      .addCase(fetchCapitalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCapitalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCapitalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Summary
      .addCase(fetchCapitalSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCapitalSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchCapitalSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createCapital.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCapital.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCapital.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateCapital.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete
      .addCase(deleteCapital.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearError } = capitalSlice.actions;
export default capitalSlice.reducer;
