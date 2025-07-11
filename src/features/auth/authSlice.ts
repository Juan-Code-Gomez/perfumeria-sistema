import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loginService } from "../../services/authService";

//
// 1. Definimos las interfaces de nuestro estado
//
export interface UserRole {
  role: { name: string };
}

export interface User {
  id: number;
  name: string;
  user_login: string;
  roles: UserRole[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

//
// 2. Creamos nuestro initialState tipado
//

const userInStorage = localStorage.getItem("user");
const tokenInStorage = localStorage.getItem("token");

const initialState: AuthState = {
  user: userInStorage ? JSON.parse(userInStorage) : null,
  token: tokenInStorage,
  loading: false,
  error: null,
};

//
// 3. Thunk para login
//
export const login = createAsyncThunk<
  // 1) Tipo de retorno del payload creator
  { user: User; token: string },
  // 2) Tipo de argumento que recibe
  { username: string; password: string },
  // 3) Tipo de rejectWithValue
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const data = await loginService(credentials);
    // suponemos que data tiene la forma: { user: User; token: string }
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Error al iniciar sesión"
    );
  }
});

//
// 4. Slice propiamente dicho, tipado con AuthState
//
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Error desconocido";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
