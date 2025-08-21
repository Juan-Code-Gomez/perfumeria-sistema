// src/features/invoices/invoiceSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as invoiceService from '../../services/invoiceService';
import type { Invoice, InvoiceSummary, CreateInvoiceData, UpdateInvoiceData, PayInvoiceData } from '../../services/invoiceService';

interface InvoiceState {
  items: Invoice[];
  summary: InvoiceSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  items: [],
  summary: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (filters: { status?: string; overdue?: boolean } = {}, thunkAPI) => {
    try {
      return await invoiceService.getInvoices(filters);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al cargar facturas');
    }
  }
);

export const fetchInvoiceSummary = createAsyncThunk(
  'invoices/fetchSummary',
  async (_, thunkAPI) => {
    try {
      return await invoiceService.getInvoiceSummary();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al cargar resumen de facturas');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (data: CreateInvoiceData, thunkAPI) => {
    try {
      return await invoiceService.createInvoice(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al crear factura');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, data }: { id: number; data: UpdateInvoiceData }, thunkAPI) => {
    try {
      return await invoiceService.updateInvoice(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al actualizar factura');
    }
  }
);

export const payInvoice = createAsyncThunk(
  'invoices/pay',
  async ({ id, data }: { id: number; data: PayInvoiceData }, thunkAPI) => {
    try {
      return await invoiceService.payInvoice(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al registrar pago');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id: number, thunkAPI) => {
    try {
      await invoiceService.deleteInvoice(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al eliminar factura');
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Summary
      .addCase(fetchInvoiceSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchInvoiceSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Pay Invoice
      .addCase(payInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
