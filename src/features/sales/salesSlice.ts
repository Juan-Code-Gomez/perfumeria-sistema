import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as salesService from "../../services/salesService";
import type { Sale, CreateSalePayload } from "../../types/SaleTypes";

interface SalesState {
  items: Sale[];
  pendingItems: any[];
  loading: boolean;
  error: string | null;
  filters: { dateFrom?: string; dateTo?: string };
  payments: any[];
  paymentsLoading: boolean;
}

const initialState: SalesState = {
  items: [],
  pendingItems: [],
  loading: false,
  error: null,
  filters: {},
  payments: [],
  paymentsLoading: false,
};

export const fetchSales = createAsyncThunk<
  Sale[],
  { dateFrom?: string; dateTo?: string } | undefined
>("sales/fetchSales", async (params, thunkAPI) => {
  try {
    return await salesService.getSales(params);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Error al cargar ventas");
  }
});

export const createSale = createAsyncThunk<Sale, CreateSalePayload>(
  "sales/createSale",
  async (saleData, thunkAPI) => {
    try {
      return await salesService.createSale(saleData);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al crear venta");
    }
  }
);

export const fetchPendingSales = createAsyncThunk(
  "sales/fetchPendingSales",
  async (_, thunkAPI) => {
    try {
      return await salesService.getPendingSales();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Error al cargar ventas pendientes"
      );
    }
  }
);

export const fetchSalePayments = createAsyncThunk(
  "sales/fetchSalePayments",
  async (saleId: number, thunkAPI) => {
    try {
      return await salesService.getSalePayments(saleId);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar pagos");
    }
  }
);

export const addSalePayment = createAsyncThunk<
  any,
  {
    saleId: number;
    amount: number;
    date: string;
    method?: string;
    note?: string;
  }
>(
  "sales/addSalePayment",
  async ({ saleId, amount, date, method, note }, thunkAPI) => {
    try {
      return await salesService.createSalePayment(saleId, {
        amount,
        date,
        method,
        note,
      });
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Error al registrar abono"
      );
    }
  }
);

export const createCreditNote = createAsyncThunk<
  any,
  {
    saleId: number;
    details: { productId: number; quantity: number }[];
  }
>(
  "sales/createCreditNote",
  async (data, thunkAPI) => {
    try {
      return await salesService.createCreditNote(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Error al crear nota de crédito"
      );
    }
  }
);

export const deleteSale = createAsyncThunk<number, number>(
  "sales/deleteSale",
  async (saleId, thunkAPI) => {
    try {
      await salesService.deleteSale(saleId);
      return saleId;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Error al eliminar venta"
      );
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
    clearPayments(state) {
      state.payments = [];
      state.paymentsLoading = false;
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

    builder
      .addCase(fetchPendingSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingSales.fulfilled, (state, action) => {
        state.pendingItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchPendingSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchSalePayments.pending, (state) => {
        state.paymentsLoading = true;
        state.error = null;
      })
      .addCase(fetchSalePayments.fulfilled, (state, action) => {
        state.payments = action.payload;
        state.paymentsLoading = false;
      })
      .addCase(fetchSalePayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addSalePayment.pending, (state) => {
        state.paymentsLoading = true;
        state.error = null;
      })
      .addCase(addSalePayment.fulfilled, (state, _action) => {
        state.paymentsLoading = false;
      })
      .addCase(addSalePayment.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createCreditNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCreditNote.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((sale) => sale.id !== action.payload);
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearPayments } = saleSlice.actions;
export default saleSlice.reducer;
