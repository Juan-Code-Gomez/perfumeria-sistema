import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as userService from "../../services/userService";

export interface UserRole {
  role: { id: number; name: string };
}
export interface User {
  id: number;
  username: string;
  name: string;
  roles: UserRole[];
  // otros campos si tienes...
}

export interface UsersState {
  items: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

// Thunk para obtener usuarios
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, thunkAPI) => {
  try {
    const data = await userService.getUsers();
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Error al cargar usuarios"
    );
  }
});

export const createUser = createAsyncThunk(
  "users/create",
  async (user: any, thunkAPI) => {
    try {
      const data = await userService.createUser(user);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Error al crear usuario");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
      const updated = await userService.updateUser(id, data);
      return updated;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Error al actualizar usuario"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: number, thunkAPI) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || "Error al eliminar usuario"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Aquí agregarás create/update/delete cuando los implementes
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar usuarios";
      })

      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
