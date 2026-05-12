import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loginService } from "../../services/authService";
import { fetchUserModules, fetchUserPermissions, clearPermissions } from "../permissions/permissionsSlice";

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
  tenantId?: number;
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
    console.log("🔥 Login thunk iniciado con credenciales:", credentials);
    const data = await loginService(credentials);
    console.log("🔥 Datos recibidos del loginService:", data);
    
    // Primero guardamos el token en localStorage antes de hacer otras peticiones
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // Después del login exitoso y guardar el token, cargar permisos del usuario
    thunkAPI.dispatch(fetchUserModules());
    thunkAPI.dispatch(fetchUserPermissions());
    
    return data;
  } catch (error: any) {
    console.error("❌ Error en login:", error);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Credenciales inválidas"
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
    clearAuth(state) {
      // Acción que también limpia permisos, se debe usar con dispatch múltiple
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
          console.log("🔥 Login fulfilled - action.payload:", action.payload);
          console.log("🔥 action.payload.user:", action.payload.user);
          console.log("🔥 action.payload.token:", action.payload.token);
          
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          
          console.log("🔥 Guardando en localStorage:");
          console.log("🔥 Token a guardar:", action.payload.token);
          console.log("🔥 User a guardar:", JSON.stringify(action.payload.user));
          
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          
          console.log("🔥 Verificando localStorage después de guardar:");
          console.log("🔥 Token en localStorage:", localStorage.getItem("token"));
          console.log("🔥 User en localStorage:", localStorage.getItem("user"));
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Error desconocido";
      });
  },
});

export const { logout, clearAuth } = authSlice.actions;

// Thunk para logout completo que también limpia permisos
export const logoutWithPermissions = createAsyncThunk(
  "auth/logoutWithPermissions",
  async (_, thunkAPI) => {
    // Limpiar auth
    thunkAPI.dispatch(clearAuth());
    // Limpiar permisos
    thunkAPI.dispatch(clearPermissions());
  }
);

export default authSlice.reducer;
