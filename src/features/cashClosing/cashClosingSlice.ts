import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as cashClosingService from "../../services/cashClosingService";

export interface CashClosing {
  id: number;
  date: string;
  openingCash: number;
  closingCash: number;
  systemCash: number;
  difference: number;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  creditSales: number;
  totalIncome: number;
  totalExpense: number;
  totalPayments: number;
  notes?: string;
  createdAt: string;
}

interface CashClosingState {
  items: CashClosing[];
  loading: boolean;
  error: string | null;
}

const initialState: CashClosingState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCashClosings = createAsyncThunk<CashClosing[], { dateFrom?: string; dateTo?: string } | undefined>(
  "cashClosing/fetchCashClosings",
  async (params, thunkAPI) => {
    try {
      return await cashClosingService.getCashClosings(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar cierres de caja");
    }
  }
);

export const createCashClosing = createAsyncThunk<CashClosing, Partial<CashClosing>>(
  "cashClosing/createCashClosing",
  async (data, thunkAPI) => {
    try {
      return await cashClosingService.createCashClosing(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al crear cierre de caja");
    }
  }
);

const cashClosingSlice = createSlice({
  name: "cashClosing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCashClosings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCashClosings.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCashClosings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCashClosing.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createCashClosing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cashClosingSlice.reducer;
