import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Sale } from './types'

interface SalesState {
  items: Sale[]
}

const initialState: SalesState = {
  items: [],
}

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    registerSale: (state, action: PayloadAction<Sale>) => {
      state.items.push(action.payload)
    },
  },
})

export const { registerSale } = salesSlice.actions
export default salesSlice.reducer