import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Purchase } from './types'

const initialState: Purchase[] = []

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    registerPurchase: (state, action: PayloadAction<Purchase>) => {
      state.push(action.payload)
    },
  },
})

export const { registerPurchase } = purchaseSlice.actions
export default purchaseSlice.reducer
