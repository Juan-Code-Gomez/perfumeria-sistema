import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as categoryService from "../../services/category";

export interface Category {
  id: number;
  name: string;
  loading?: boolean;
  listCategories?: Category[];
}

const initialState: Category = {
  id: 0,
  name: "",
  loading: false,
  listCategories: [],
};

export const createCategory = createAsyncThunk(
  "categories/create",
  async (category: { name: string }, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(category);
      return response;
    } catch (error) {
      return rejectWithValue("Error al crear la categoría");
    }
  }
);

export const getCategories = createAsyncThunk(
  "categories/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories();
      return response;
    } catch (error) {
      return rejectWithValue("Error al obtener las categorías");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (category: { id: number; name: string }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(category);
      return response;
    } catch (error) {
      return rejectWithValue("Error al actualizar la categoría");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await categoryService.deleteCategory(id);
      return response;
    } catch (error) {
      return rejectWithValue("Error al eliminar la categoría");
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    resetCategory(state) {
      state.id = 0;
      state.name = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCategory.pending, (state) => {
        state.id = 0;
        state.name = "";
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.loading = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.listCategories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
  },
});

export const { resetCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
