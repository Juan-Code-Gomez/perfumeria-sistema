import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as unitService from "../../services/unit";

export interface Unit {
  id: number;
  name: string;
  loading?: boolean;
  listUnits?: Unit[];
}

const initialState: Unit = {
  id: 0,
  name: "",
  loading: false,
  listUnits: [],
};

export const createUnit = createAsyncThunk(
  "units/create",
  async (unit: { name: string }, { rejectWithValue }) => {
    try {
      const response = await unitService.createUnit(unit);
      return response;
    } catch (error) {
      return rejectWithValue("Error al crear la unidad");
    }
  }
);

export const getUnits = createAsyncThunk(
  "units/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await unitService.getUnits();
      return response;
    } catch (error) {
      return rejectWithValue("Error al obtener las unidades");
    }
  }
);

export const updateUnit = createAsyncThunk(
  "units/update",
  async (unit: { id: number; name: string }, { rejectWithValue }) => {
    try {
      const response = await unitService.updateUnit(unit);
      return response;
    } catch (error) {
      return rejectWithValue("Error al actualizar la unidad");
    }
  }
);

export const deleteUnit = createAsyncThunk(
  "units/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await unitService.deleteUnit(id);
      return response;
    } catch (error) {
      return rejectWithValue("Error al eliminar la unidad");
    }
  }
);

const unitsSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    resetUnit(state) {
      state.id = 0;
      state.name = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUnit.pending, (state) => {
        state.id = 0;
        state.name = "";
        state.loading = true;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.loading = false;
      })
      .addCase(createUnit.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
    builder
      .addCase(getUnits.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.listUnits = action.payload;
      })
      .addCase(getUnits.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
    builder
      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateUnit.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
    builder
      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        console.error(action.payload);
        state.loading = false;
      });
  },
});

export const { resetUnit } = unitsSlice.actions;
export default unitsSlice.reducer;