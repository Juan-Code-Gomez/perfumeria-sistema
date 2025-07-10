import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import authReducer from '../features/auth/authSlice'
import productReducer from '../features/products/productSlice'
import providerReducer from '../features/providers/providerSlice'
import purchaseReducer from '../features/purchases/purchaseSlice'
import expenseReducer from '../features/expenses/expenseSlice'
import salesReducer from '../features/sales/salesSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import unitsReducer from '../features/units/unitsSlice'
import suppliersReducer from '../features/suppliers/supplierSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    providers: providerReducer,
    purchases: purchaseReducer,
    expenses: expenseReducer,
    sales: salesReducer,
    categories: categoriesReducer,
    units: unitsReducer,
    suppliers: suppliersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector