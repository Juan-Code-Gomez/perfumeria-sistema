import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Product } from './types'

const initialState: Product[] = [
  {
    id: 1,
    name: 'Esencia de vainilla',
    description: 'Fragancia suave y dulce',
    unit: 'ml',
    stock: 250,
    purchasePrice: 500,
    salePrice: 1500,
  },
  {
    id: 2,
    name: 'Loción 1.1 para hombre',
    unit: 'unit',
    stock: 20,
    purchasePrice: 15000,
    salePrice: 30000,
  },
]

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.push(action.payload)
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.findIndex(p => p.id === action.payload.id)
      if (index !== -1) state[index] = action.payload
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      return state.filter(p => p.id !== action.payload)
    },
  },
})

export const { addProduct, updateProduct, deleteProduct } = productSlice.actions
export default productSlice.reducer
