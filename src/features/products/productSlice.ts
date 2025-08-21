// src/features/products/productSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "./types";
import * as productService from "../../services/productService";

export interface ProductFilters {
  name?: string;
  search?: string;
  categoryId?: number;
  unitId?: number;
  supplierId?: number;
  stockMin?: number;
  stockMax?: number;
  includeInactive?: boolean;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
}
export interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  page: number;
  pageSize: number;
  total: number;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
  page: 1,
  pageSize: 7,
  total: 0,
};

// Thunk para traer productos con filtros
export const fetchProducts = createAsyncThunk<
  { data: { items: Product[]; total: number; page: number; pageSize: number } },
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

export const fetchProductById = createAsyncThunk<
  Product,
  number,
  { rejectValue: string }
>("products/fetchById", async (id, thunkAPI) => {
  try {
    const data = await productService.getProductById(id);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Error al cargar el producto"
    );
  }
});

export const createProduct = createAsyncThunk<
  Product,
  Partial<Product>,
  { rejectValue: string }
>("products/create", async (product, thunkAPI) => {
  try {
    const data = await productService.createProduct(product);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Error al crear producto");
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: number; product: Partial<Product> },
  { rejectValue: string }
>("products/update", async ({ id, product }, thunkAPI) => {
  try {
    const data = await productService.updateProduct(id, product);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Error al actualizar producto"
    );
  }
});

export const deleteProduct = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("products/delete", async (id, thunkAPI) => {
  try {
    await productService.deleteProduct(id);
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Error al eliminar producto"
    );
  }
});

export const bulkUploadProducts = createAsyncThunk<
  { mensaje: string; productosCreados: number; productosActualizados: number; comprasCreadas: number; errores: any[] },
  { file: File; withSupplier: boolean },
  { rejectValue: string }
>("products/bulkUpload", async ({ file, withSupplier }, thunkAPI) => {
  try {
    const result = await productService.bulkUploadProducts(file, withSupplier);
    return result;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Error en la carga masiva"
    );
  }
});

export const exportProducts = createAsyncThunk<
  { success: boolean; message: string },
  void,
  { rejectValue: string }
>("products/export", async (_, thunkAPI) => {
  try {
    const result = await productService.exportProductsToExcel();
    return result;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.message || "Error al exportar productos"
    );
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<ProductFilters>) {
      // Permite sobreescribir page/pageSize si los incluye en los filtros
      state.filters = { ...state.filters, ...action.payload };
      // Reinicia a página 1 al cambiar filtros principales (excepto si es solo cambio de página)
      if (!("page" in action.payload)) {
        state.page = 1;
      }
    },
    clearFilters(state) {
      state.filters = {};
      state.page = 1;
    },
    setPage(state, action: PayloadAction<{ page: number; pageSize: number }>) {
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.filters = {
        ...state.filters,
        page: action.payload.page,
        pageSize: action.payload.pageSize,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log('fetchProducts.fulfilled payload:', action.payload);

        state.items = action.payload.data.items || [];
        state.total = action.payload.data.total || 0;
        state.page = action.payload.data.page || 1;
        state.pageSize = action.payload.data.pageSize || 7;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error desconocido";
      });
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload; // Actualiza el producto existente
        } else {
          state.items.push(action.payload); // O agrega el nuevo producto
        }
        state.loading = false;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error desconocido al cargar producto";
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        console.log('createProduct.fulfilled payload:', action.payload);
        if (action.payload) {
          state.items.push(action.payload);
          state.total += 1; // Incrementar el total también
        }
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error desconocido al crear producto";
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload; // Actualiza el producto existente
        }
        state.loading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Error desconocido al actualizar producto";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Error desconocido al eliminar producto";
      })
      .addCase(exportProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportProducts.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error al exportar productos";
      });
  },
});

export const { setFilters, clearFilters, setPage } = productSlice.actions;
export default productSlice.reducer;
