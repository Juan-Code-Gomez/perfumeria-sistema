// src/features/dashboard/dashboardSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDashboard } from "../../services/dashboardService";

interface DashboardState {
  summary: any;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (params: { dateFrom?: string; dateTo?: string } = {}, thunkAPI) => {
    try {
      return await getDashboard(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al cargar dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading = false;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
