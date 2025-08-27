import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchRoles = createAsyncThunk('roles/fetch', async () => {
  const res = await api.get('/roles');
  return res.data.data;
});

export const createRole = createAsyncThunk('roles/create', async (data: { name: string; description: string }) => {
  const res = await api.post('/roles', data);
  return res.data.data || res.data;
});

export const updateRole = createAsyncThunk('roles/update', async ({ id, data }: { id: number; data: { name?: string; description?: string } }) => {
  const res = await api.put(`/roles/${id}`, data);
  return res.data.data || res.data;
});

export const deleteRole = createAsyncThunk('roles/delete', async (id: number) => {
  await api.delete(`/roles/${id}`);
  return id;
});

interface Role {
  id: number;
  name: string;
  description: string;
}

interface RolesState {
  items: Role[];
  loading: boolean;
  error: string | null;
}

const rolesSlice = createSlice({
  name: 'roles',
  initialState: { items: [], loading: false, error: null as null | string } as RolesState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.items = action.payload; state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      
      // Create role
      .addCase(createRole.pending, (state) => { state.loading = true; })
      .addCase(createRole.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      
      // Update role
      .addCase(updateRole.pending, (state) => { state.loading = true; })
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      
      // Delete role
      .addCase(deleteRole.pending, (state) => { state.loading = true; })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default rolesSlice.reducer;
