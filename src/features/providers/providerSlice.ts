import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Provider } from './types'

const initialState: Provider[] = [
  {
    id: 1,
    name: 'Distribuidora Aroma',
    phone: '3001234567',
    address: 'Calle 10 #45-30, Cali',
  },
]

const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    addProvider: (state, action: PayloadAction<Provider>) => {
      state.push(action.payload)
    },
    updateProvider: (state, action: PayloadAction<Provider>) => {
      const index = state.findIndex(p => p.id === action.payload.id)
      if (index !== -1) state[index] = action.payload
    },
    deleteProvider: (state, action: PayloadAction<number>) => {
      return state.filter(p => p.id !== action.payload)
    },
  },
})

export const { addProvider, updateProvider, deleteProvider } = providerSlice.actions
export default providerSlice.reducer
