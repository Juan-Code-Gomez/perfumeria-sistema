import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import permissionsService from '../../services/permissionsService';
import type { Module, Permission } from '../../services/permissionsService';

interface PermissionsState {
  userModules: Module[];
  userPermissions: Permission[];
  allModules: Module[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  userModules: [],
  userPermissions: [],
  allModules: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchUserModules = createAsyncThunk(
  'permissions/fetchUserModules',
  async (_, thunkAPI) => {
    try {
      return await permissionsService.getMyModules();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al cargar módulos del usuario');
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async (_, thunkAPI) => {
    try {
      return await permissionsService.getMyPermissions();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al cargar permisos del usuario');
    }
  }
);

export const fetchAllModules = createAsyncThunk(
  'permissions/fetchAllModules',
  async (_, thunkAPI) => {
    try {
      return await permissionsService.getAllModules();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al cargar todos los módulos');
    }
  }
);

export const updateRolePermissions = createAsyncThunk(
  'permissions/updateRolePermissions',
  async ({ roleId, permissions }: { 
    roleId: number; 
    permissions: Array<{
      moduleId: number;
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canExport: boolean;
    }>
  }, thunkAPI) => {
    try {
      return await permissionsService.updateRolePermissions(roleId, permissions);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Error al actualizar permisos del rol');
    }
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissions: (state) => {
      state.userModules = [];
      state.userPermissions = [];
      state.allModules = [];
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Modules
      .addCase(fetchUserModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserModules.fulfilled, (state, action) => {
        state.loading = false;
        state.userModules = action.payload;
      })
      .addCase(fetchUserModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch User Permissions
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.userPermissions = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch All Modules
      .addCase(fetchAllModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.loading = false;
        state.allModules = action.payload;
      })
      .addCase(fetchAllModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Role Permissions
      .addCase(updateRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRolePermissions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPermissions, setError } = permissionsSlice.actions;
export default permissionsSlice.reducer;

// Selectores
export const selectUserModules = (state: { permissions: PermissionsState }) => state.permissions.userModules;
export const selectUserPermissions = (state: { permissions: PermissionsState }) => state.permissions.userPermissions;
export const selectAllModules = (state: { permissions: PermissionsState }) => state.permissions.allModules;
export const selectPermissionsLoading = (state: { permissions: PermissionsState }) => state.permissions.loading;
export const selectPermissionsError = (state: { permissions: PermissionsState }) => state.permissions.error;
