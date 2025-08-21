import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as unitService from "../../services/unit";
import type { Unit, UnitStatistics } from "../../services/unit";

export interface UnitsState {
  listUnits: Unit[];
  statistics: UnitStatistics | null;
  loading: boolean;
  error: string | null;
}

const initialState: UnitsState = {
  listUnits: [],
  statistics: null,
  loading: false,
  error: null,
};

export const createUnit = createAsyncThunk(
  "units/create",
  async (unit: { name: string; symbol?: string; description?: string; unitType?: string; isDecimal?: boolean }, { rejectWithValue }) => {
    try {
      const response = await unitService.createUnit(unit);
      // El backend puede devolver doble estructura
      const responseData = (response as any).success ? (response as any).data : response;
      return responseData.success ? responseData.data : responseData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al crear la unidad");
    }
  }
);

export const getUnits = createAsyncThunk(
  "units/getAll",
  async (params: { includeInactive?: boolean; search?: string; unitType?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await unitService.getUnits(params);
      // Ya manejado en el servicio
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener las unidades");
    }
  }
);

export const getUnitStatistics = createAsyncThunk(
  "units/getStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await unitService.getUnitStatistics();
      // Ya manejado en el servicio
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener estadísticas");
    }
  }
);

export const updateUnit = createAsyncThunk(
  "units/update",
  async (unit: { id: number; name: string; symbol?: string; description?: string; unitType?: string; isDecimal?: boolean }, { rejectWithValue }) => {
    try {
      const response = await unitService.updateUnit(unit);
      // El backend puede devolver doble estructura
      const responseData = (response as any).success ? (response as any).data : response;
      return responseData.success ? responseData.data : responseData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al actualizar la unidad");
    }
  }
);

export const deleteUnit = createAsyncThunk(
  "units/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await unitService.deleteUnit(id);
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al eliminar la unidad");
    }
  }
);

export const toggleUnitStatus = createAsyncThunk(
  "units/toggleStatus",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await unitService.toggleUnitStatus(id);
      // El backend puede devolver doble estructura
      const responseData = (response as any).success ? (response as any).data : response;
      return responseData.success ? responseData.data : responseData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error al cambiar estado");
    }
  }
);

const unitsSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Unit
      .addCase(createUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.listUnits.push(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Units
      .addCase(getUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.listUnits = action.payload;
      })
      .addCase(getUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Statistics
      .addCase(getUnitStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnitStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getUnitStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Unit
      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.listUnits.findIndex(unit => unit.id === action.payload.id);
        if (index !== -1) {
          state.listUnits[index] = action.payload;
        }
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Unit
      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.listUnits = state.listUnits.filter(unit => unit.id !== action.payload.id);
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Status
      .addCase(toggleUnitStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUnitStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.listUnits.findIndex(unit => unit.id === action.payload.id);
        if (index !== -1) {
          state.listUnits[index] = action.payload;
        }
      })
      .addCase(toggleUnitStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = unitsSlice.actions;
export default unitsSlice.reducer;