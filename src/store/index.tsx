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
import usersReducer from '../features/users/userSlice'
import rolesReducer from '../features/roles/rolesSlice'
import cashClosingReducer from '../features/cashClosing/cashClosingSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import clienstReducer from '../features/clients/clientSlice'
import capitalReducer from '../features/capital/capitalSlice'
import invoiceReducer from '../features/invoices/invoiceSlice'

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
    users: usersReducer,
    roles: rolesReducer,
    cashClosing: cashClosingReducer,
    dashboard: dashboardReducer,
    clients: clienstReducer,
    capital: capitalReducer,
    invoices: invoiceReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector