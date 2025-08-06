import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as salesService from "../../services/salesService";
import type { Sale, CreateSalePayload } from "../../types/SaleTypes";

interface SalesState {
  items: Sale[];
  pendingItems: any[];
  loading: boolean;
  error: string | null;
  filters: { dateFrom?: string; dateTo?: string };
  payments: any[]; // historial de abonos de una venta seleccionada
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

// Thunks
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

// Obtener pagos/abonos de una venta
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

// Registrar un nuevo abono/pago a una venta
export const addSalePayment = createAsyncThunk(
  "sales/addSalePayment",
  async (
    {
      saleId,
      amount,
      date,
      method,
      note,
    }: {
      saleId: number;
      amount: number;
      date: string;
      method?: string;
      note?: string;
    },
    thunkAPI
  ) => {
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

export const createCreditNote = createAsyncThunk(
  "sales/createCreditNote",
  async (
    data: {
      saleId: number;
      details: { productId: number; quantity: number }[];
    },
    thunkAPI
  ) => {
    try {
      return await salesService.createCreditNote(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Error al crear nota de crédito"
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
    // Ventas normales
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

    // Ventas pendientes
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

    // Historial de abonos
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

    // Nuevo abono
    builder
      .addCase(addSalePayment.pending, (state) => {
        state.paymentsLoading = true;
        state.error = null;
      })
      .addCase(addSalePayment.fulfilled, (state, _action) => {
        // Agrega el nuevo pago al historial (si es necesario), o puedes refrescar después
        state.paymentsLoading = false;
      })
      .addCase(addSalePayment.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.error = action.payload as string;
      });

    // Nota de crédito
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
  },
});

export const { setFilters, clearPayments } = saleSlice.actions;
export default saleSlice.reducer;
