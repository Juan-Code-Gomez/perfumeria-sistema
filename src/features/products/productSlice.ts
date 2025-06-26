// src/features/products/productSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "./types";
import * as productService from "../../services/productService";

export interface ProductFilters {
  name?: string;
  categoryId?: number;
  stockMin?: number;
}

export interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
};

// Thunk para traer productos con filtros
export const fetchProducts = createAsyncThunk<
  Product[],
  ProductFilters | undefined,
  { rejectValue: string }
>("products/fetch", async (filters, thunkAPI) => {
  try {
    const data = await productService.getProducts(filters);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Error al cargar productos");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ProductFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error desconocido";
      });
  },
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;
