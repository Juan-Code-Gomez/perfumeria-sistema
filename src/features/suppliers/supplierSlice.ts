// src/features/suppliers/supplierSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as supplierService from "../../services/supplierService";

export interface Supplier {
  id: number;
  name: string;
  nit?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  website?: string;
  paymentTerms?: string;
  creditLimit?: number;
  currentDebt?: number;
  supplierType?: string;
  specializedCategories?: string[];
  isActive?: boolean;
  isPreferred?: boolean;
  minOrderAmount?: number;
  leadTimeDays?: number;
  rating?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierData {
  name: string;
  nit?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  website?: string;
  paymentTerms?: string;
  creditLimit?: number;
  supplierType?: string;
  specializedCategories?: string[];
  isActive?: boolean;
  isPreferred?: boolean;
  minOrderAmount?: number;
  leadTimeDays?: number;
  rating?: number;
  notes?: string;
}

interface SuppliersState {
  items: Supplier[];
  loading: boolean;
  error: string | null;
  statistics: {
    total: number;
    withDebt: number;
    totalDebt: number;
  } | null;
}

const initialState: SuppliersState = {
  items: [],
  loading: false,
  error: null,
  statistics: null,
};

export const fetchSuppliers = createAsyncThunk<Supplier[], void, { rejectValue: string }>(
  "suppliers/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await supplierService.getSuppliers();
      return response.data || response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? "Error al cargar proveedores");
    }
  }
);

export const createSupplier = createAsyncThunk<Supplier, CreateSupplierData, { rejectValue: string }>(
  "suppliers/create",
  async (supplierData, thunkAPI) => {
    try {
      const response = await supplierService.createSupplier(supplierData);
      return response.data || response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? "Error al crear proveedor");
    }
  }
);

export const updateSupplier = createAsyncThunk<Supplier, { id: number; data: Partial<CreateSupplierData> }, { rejectValue: string }>(
  "suppliers/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await supplierService.updateSupplier(id, data);
      return response.data || response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? "Error al actualizar proveedor");
    }
  }
);

export const deleteSupplier = createAsyncThunk<number, number, { rejectValue: string }>(
  "suppliers/delete",
  async (id, thunkAPI) => {
    try {
      await supplierService.deleteSupplier(id);
      return id;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? "Error al eliminar proveedor");
    }
  }
);

export const fetchSuppliersWithDebt = createAsyncThunk<Supplier[], void, { rejectValue: string }>(
  "suppliers/fetchWithDebt",
  async (_, thunkAPI) => {
    try {
      const response = await supplierService.getSuppliersWithDebt();
      return response;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? "Error al cargar proveedores con deuda");
    }
  }
);

const supplierSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error desconocido";
      })
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al crear proveedor";
      })
      // Update supplier
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete supplier
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Fetch suppliers with debt
      .addCase(fetchSuppliersWithDebt.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearError } = supplierSlice.actions;
export default supplierSlice.reducer;
