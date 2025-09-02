import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as clientAPI from "../../services/clientService";
import type { Client } from "./types";

export const addClient = createAsyncThunk(
  "clients/addClient",
  async (data: Parameters<typeof clientAPI.createClient>[0]) => {
    return await clientAPI.createClient(data);
  }
);

export const searchClients = createAsyncThunk(
  "clients/searchClients",
  async (name: string) => {
    return await clientAPI.findClients(name);
  }
);

export const removeClient = createAsyncThunk(
  "clients/removeClient",
  async (id: number) => {
    return await clientAPI.deleteClient(id);
  }
);

export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async ({
    id,
    data,
  }: {
    id: number;
    data: Parameters<typeof clientAPI.updateClient>[1];
  }) => {
    return await clientAPI.updateClient(id, data);
  }
);

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    clearClients(state) {
      state.clients = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchClients.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Manejar respuesta estructurada del backend con mejor lógica
        let responseData = payload;
        
        // Si hay una estructura anidada { success: true, data: { success: true, data: [...] } }
        if ((payload as any)?.data?.data) {
          responseData = (payload as any).data.data;
        }
        // Si hay una estructura simple { success: true, data: [...] }
        else if ((payload as any)?.data) {
          responseData = (payload as any).data;
        }
        
        // Asegurar que sea un array
        state.clients = Array.isArray(responseData) ? responseData : [];
        console.log('Clientes cargados:', state.clients); // Debug log
      })
      .addCase(searchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al buscar clientes";
      })
      .addCase(addClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addClient.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Manejar respuesta estructurada del backend con mejor lógica
        let newClient = payload;
        
        // Si hay una estructura anidada { success: true, data: { success: true, data: cliente } }
        if ((payload as any)?.data?.data) {
          newClient = (payload as any).data.data;
        }
        // Si hay una estructura simple { success: true, data: cliente }
        else if ((payload as any)?.data) {
          newClient = (payload as any).data;
        }
        
        // Agregar el nuevo cliente al inicio de la lista
        state.clients.unshift(newClient);
        console.log('Cliente agregado:', newClient); // Debug log
      })
      .addCase(addClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al crear cliente";
      })

      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Manejar respuesta estructurada del backend con mejor lógica
        let updatedClient = payload;
        
        // Si hay una estructura anidada { success: true, data: { success: true, data: cliente } }
        if ((payload as any)?.data?.data) {
          updatedClient = (payload as any).data.data;
        }
        // Si hay una estructura simple { success: true, data: cliente }
        else if ((payload as any)?.data) {
          updatedClient = (payload as any).data;
        }
        
        state.clients = state.clients.map((c) =>
          c.id === updatedClient.id ? updatedClient : c
        );
        console.log('Cliente actualizado:', updatedClient); // Debug log
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message!;
      })

      .addCase(removeClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeClient.fulfilled, (state, { payload: id }) => {
        state.loading = false;
        state.clients = state.clients.filter((c) => c.id !== id);
      })
      .addCase(removeClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message!;
      });
  },
});

export const { clearClients } = clientSlice.actions;
export default clientSlice.reducer;
