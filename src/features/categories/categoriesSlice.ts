import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as categoryService from "../../services/category";
import type { Category, CategoryStatistics } from "../../services/category";

export interface CategoriesState {
  listCategories: Category[];
  statistics: CategoryStatistics | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  listCategories: [],
  statistics: null,
  loading: false,
  error: null,
};

export const createCategory = createAsyncThunk(
  "categories/create",
  async (category: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(category);
      // El backend devuelve { success: true, data: category }
      return (response as any).success ? (response as any).data : response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al crear la categoría");
    }
  }
);

export const getCategories = createAsyncThunk(
  "categories/getAll",
  async (params: { includeInactive?: boolean; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(params);
      // El backend devuelve { success: true, data: categories[] }
      return (response as any).success ? (response as any).data : response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener las categorías");
    }
  }
);

export const getCategoryStatistics = createAsyncThunk(
  "categories/getStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryStatistics();
      return (response as any).success ? (response as any).data : response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener estadísticas");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (category: { id: number; name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(category);
      return (response as any).success ? (response as any).data : response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al actualizar la categoría");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al eliminar la categoría");
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  "categories/toggleStatus",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await categoryService.toggleCategoryStatus(id);
      return (response as any).success ? (response as any).data : response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al cambiar estado");
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        // Solo agregamos la nueva categoría si tiene un ID válido
        if (action.payload && action.payload.id) {
          state.listCategories.push(action.payload);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Categories
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.listCategories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Statistics
      .addCase(getCategoryStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getCategoryStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.listCategories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.listCategories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.listCategories = state.listCategories.filter(cat => cat.id !== action.payload.id);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Status
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.listCategories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.listCategories[index] = action.payload;
        }
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
