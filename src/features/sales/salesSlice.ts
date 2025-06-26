// src/features/sales/salesSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as salesService from "../../services/salesService";
import type { SaleData } from "../../types/SaleTypes";
import axios from "axios";

interface Sale {
  id: number;
  customerName: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
}

interface SalesState {
  salesList: Sale[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  salesList: [],
  loading: false,
  error: null,
};

// ✅ Thunk para obtener las ventas
export const fetchSales = createAsyncThunk("sales/fetch", async () => {
  return await salesService.getSales();
});

export const createSaleThunk = createAsyncThunk(
  "sales/create",
  async (saleData: SaleData) => {
    return await salesService.createSale(saleData);
  }
);

export const deleteSaleThunk = createAsyncThunk(
  "sales/delete",
  async (id: number) => {
    return await salesService.deleteSale(id);
  }
);

export const updateSaleThunk = createAsyncThunk(
  "sales/update",
  async ({ id, saleData }: { id: number; saleData: SaleData }) => {
    return await salesService.updateSale(id, saleData);
  }
);

// ✅ Slice
const salesSlice = createSlice({
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
        state.loading = false;
        state.salesList = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al cargar ventas";
      });
    builder
      .addCase(createSaleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSaleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.salesList.push(action.payload);
      })
      .addCase(createSaleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al crear venta";
      });
    builder
      .addCase(deleteSaleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSaleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.salesList = state.salesList.filter(
          (sale) => sale.id !== action.payload.id
        );
      })
      .addCase(deleteSaleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al eliminar venta";
      });
    builder.addCase(updateSaleThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSaleThunk.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.salesList.findIndex(
        (sale) => sale.id === action.payload.id
      );
      if (index !== -1) {
        state.salesList[index] = action.payload;
      }
    });
    builder.addCase(updateSaleThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Error al actualizar venta";
    });
  },
});

export default salesSlice.reducer;
