// src/features/expenses/expenseSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as expensesService from "../../services/expenseService";

export interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  notes?: string;
}

export interface ExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  paymentMethod?: string;
  search?: string;
  isRecurring?: boolean;
  page?: number;
  pageSize?: number;
}

interface ExpenseState {
  items: Expense[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  summary: {
    total: number;
    dailyAverage: number;
    previousMonthTotal: number;
    byCategory: Record<string, number>;
    byPaymentMethod: Record<string, number>;
  };
}

const initialState: ExpenseState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  filters: { page: 1, pageSize: 20 },
  summary: { 
    total: 0, 
    dailyAverage: 0,
    previousMonthTotal: 0,
    byCategory: {},
    byPaymentMethod: {}
  },
};

// 1) Thunk para lista + total
export const fetchExpenses = createAsyncThunk<
  { items: Expense[]; total: number },
  ExpenseFilters | undefined
>(
  "expenses/fetchExpenses",
  async (params, thunkAPI) => {
    try {
      return await expensesService.getExpenses(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar gastos");
    }
  }
);

// 2) Thunk para summary
export const fetchExpenseSummary = createAsyncThunk<
  { 
    total: number; 
    dailyAverage: number;
    previousMonthTotal: number;
    byCategory: Record<string, number>;
    byPaymentMethod: Record<string, number>;
  },
  { dateFrom?: string; dateTo?: string } | undefined
>(
  "expenses/fetchExpenseSummary",
  async (params, thunkAPI) => {
    try {
      return await expensesService.getExpenseSummary(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar resumen");
    }
  }
);

// 3) CRUD thunks (sin cambios)
export const createExpense = createAsyncThunk<Expense, Omit<Expense, "id">>(
  "expenses/createExpense",
  async (expenseData, thunkAPI) => {
    try {
      return await expensesService.createExpense(expenseData);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al crear gasto");
    }
  }
);

export const editExpense = createAsyncThunk<
  Expense,
  { id: number; payload: Omit<Expense, "id"> }
>(
  "expenses/editExpense",
  async ({ id, payload }, thunkAPI) => {
    try {
      return await expensesService.updateExpense(id, payload);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al editar gasto");
    }
  }
);

export const removeExpense = createAsyncThunk<void, number>(
  "expenses/removeExpense",
  async (id, thunkAPI) => {
    try {
      await expensesService.deleteExpense(id);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al eliminar gasto");
    }
  }
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    // Actualizar filtros (fecha, página, categoría…)
    setFilters(state, action: PayloadAction<ExpenseFilters>) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // fetchExpenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.loading = false;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchExpenseSummary
    builder
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchExpenseSummary.rejected, () => {
        // opcional: manejar error de summary
      });

    // createExpense
    builder
      .addCase(createExpense.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // editExpense
    builder
      .addCase(editExpense.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });

    // removeExpense
    builder.addCase(removeExpense.fulfilled, () => {
      // tras borrar, recargará la lista en el componente
    });
  },
});

export const { setFilters } = expenseSlice.actions;
export default expenseSlice.reducer;
