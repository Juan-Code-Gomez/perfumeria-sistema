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
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const data = await userService.getUsers();
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Error al cargar usuarios");
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
      });
  },
});

export default userSlice.reducer;
