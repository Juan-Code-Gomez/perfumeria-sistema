import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import authReducer from '../features/auth/authSlice'
import productReducer from '../features/products/productSlice'
import providerReducer from '../features/providers/providerSlice'
import purchaseReducer from '../features/purchases/purchaseSlice'
import expenseReducer from '../features/expenses/expenseSlice'
import salesReducer from '../features/sales/salesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    providers: providerReducer,
    purchases: purchaseReducer,
    expenses: expenseReducer,
    sales: salesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()