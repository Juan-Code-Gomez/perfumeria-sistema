// src/features/purchases/purchaseSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as purchaseService from "../../services/purchaseService";

export interface PurchaseFilters {
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PurchaseState {
  items: any[];
  loading: boolean;
  error: string | null;
  filters: PurchaseFilters;
}

const initialState: PurchaseState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
};

export const fetchPurchases = createAsyncThunk(
  "purchases/fetch",
  async (filters: PurchaseFilters | undefined, thunkAPI) => {
    try {
      return await purchaseService.getPurchases(filters);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar compras");
    }
  }
);

export const createPurchase = createAsyncThunk(
  "purchases/create",
  async (purchaseData: any, thunkAPI) => {
    try {
      return await purchaseService.createPurchase(purchaseData);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al guardar compra");
    }
  }
);

const purchaseSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Error al cargar compras";
      });
    builder
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Error al guardar compra";
      });
  },
});

export const { setFilters, clearFilters } = purchaseSlice.actions;
export default purchaseSlice.reducer;
