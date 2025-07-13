import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as expensesService from "../../services/expenseService";

export interface Expense {
  id: number;
  date: string;
  concept: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

interface ExpenseState {
  items: Expense[];
  loading: boolean;
  error: string | null;
  filters: { dateFrom?: string; dateTo?: string };
}

const initialState: ExpenseState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
};

export const fetchExpenses = createAsyncThunk<Expense[], { dateFrom?: string; dateTo?: string } | undefined>(
  "expenses/fetchExpenses",
  async (params, thunkAPI) => {
    try {
      return await expensesService.getExpenses(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar gastos");
    }
  }
);

export const createExpense = createAsyncThunk<Expense, Expense>(
  "expenses/createExpense",
  async (expenseData, thunkAPI) => {
    try {
      return await expensesService.createExpense(expenseData);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al crear gasto");
    }
  }
);

export const editExpense = createAsyncThunk<Expense, { id: number; payload: Expense }>(
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
    setFilters(state, action) {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters } = expenseSlice.actions;
export default expenseSlice.reducer;
