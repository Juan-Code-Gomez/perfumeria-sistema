import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as salesService from "../../services/salesService";
import type { Sale } from "../../types/SaleTypes";

interface SalesState {
  items: Sale[];
  loading: boolean;
  error: string | null;
  filters: { dateFrom?: string; dateTo?: string };
}

const initialState: SalesState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
};

export const fetchSales = createAsyncThunk<Sale[], { dateFrom?: string; dateTo?: string } | undefined>(
  "sales/fetchSales",
  async (params, thunkAPI) => {
    try {
      return await salesService.getSales(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar ventas");
    }
  }
);

export const createSale = createAsyncThunk<Sale, Sale>(
  "sales/createSale",
  async (saleData, thunkAPI) => {
    try {
      return await salesService.createSale(saleData);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al crear venta");
    }
  }
);

const saleSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
        setFilters(state, action) {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters } = saleSlice.actions;
export default saleSlice.reducer;
