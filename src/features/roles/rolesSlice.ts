import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchRoles = createAsyncThunk('roles/fetch', async () => {
  const res = await api.get('/roles');
  return res.data;
});

const rolesSlice = createSlice({
  name: 'roles',
  initialState: { items: [], loading: false, error: null as null | string },
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
      });
  },
});

export default rolesSlice.reducer;
