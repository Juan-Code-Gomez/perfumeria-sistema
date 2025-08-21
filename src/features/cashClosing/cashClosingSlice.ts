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
  summary?: CashClosingSummary;
  loadingSummary?: boolean;
}

interface CashClosingSummary {
  fecha: string;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  creditSales: number;
  totalIncome: number;
  totalExpense: number;
  totalPayments: number;
  systemCash: number;
}

const initialState: CashClosingState = {
  items: [],
  loading: false,
  error: null,
  summary: undefined,
  loadingSummary: false,
};

export const fetchCashClosings = createAsyncThunk<
  CashClosing[],
  { dateFrom?: string; dateTo?: string } | undefined
>("cashClosing/fetchCashClosings", async (params, thunkAPI) => {
  try {
    const result = await cashClosingService.getCashClosings(params);
    console.log('Fetch cash closings result:', result);
    return result;
  } catch (err: any) {
    console.error('Error fetching cash closings:', err);
    return thunkAPI.rejectWithValue(
      err.message || "Error al cargar cierres de caja"
    );
  }
});

export const createCashClosing = createAsyncThunk<
  CashClosing,
  Partial<CashClosing>
>("cashClosing/createCashClosing", async (data, thunkAPI) => {
  try {
    return await cashClosingService.createCashClosing(data);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Error al crear cierre de caja"
    );
  }
});

export const fetchCashClosingSummary = createAsyncThunk<
  CashClosingSummary,
  string
>("cashClosing/fetchCashClosingSummary", async (date, thunkAPI) => {
  try {
    console.log('Fetching cash closing summary for date:', date);
    const result = await cashClosingService.getCashClosingSummary(date);
    console.log('Cash closing summary result:', result);
    return result;
  } catch (err: any) {
    console.error('Error fetching cash closing summary:', err);
    return thunkAPI.rejectWithValue(
      err.message || "Error al cargar resumen de cierre"
    );
  }
});

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
        // Asegurar que siempre sea un array
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCashClosings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.items = []; // Reset items en caso de error
      })
      .addCase(createCashClosing.fulfilled, (state, action) => {
        // Asegurar que items sea un array antes de agregar
        if (Array.isArray(state.items)) {
          state.items.unshift(action.payload);
        } else {
          state.items = [action.payload];
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(createCashClosing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCashClosingSummary.pending, (state) => {
        state.loadingSummary = true;
        state.summary = undefined;
      })
      .addCase(fetchCashClosingSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loadingSummary = false;
      })
      .addCase(fetchCashClosingSummary.rejected, (state) => {
        state.loadingSummary = false;
        state.summary = undefined;
      });
  },
});

export default cashClosingSlice.reducer;
