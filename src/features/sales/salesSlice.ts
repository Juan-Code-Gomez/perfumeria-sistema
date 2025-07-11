import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as salesService from "../../services/salesService";
import type { Sale } from "../../types/SaleTypes";

interface SalesState {
  items: Sale[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchSales = createAsyncThunk<Sale[]>(
  "sales/fetchSales",
  async (_, thunkAPI) => {
    try {
      return await salesService.getSales();
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
  reducers: {},
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

export default saleSlice.reducer;
