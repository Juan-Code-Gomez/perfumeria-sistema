// src/features/suppliers/supplierSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as supplierService from "../../services/supplierService";

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
}

interface SuppliersState {
  items: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchSuppliers = createAsyncThunk<Supplier[], void, { rejectValue: string }>(
  "suppliers/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await supplierService.getSuppliers();
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message ?? "Error al cargar proveedores");
    }
  }
);

const supplierSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default supplierSlice.reducer;
