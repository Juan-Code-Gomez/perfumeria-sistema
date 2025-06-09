import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type Expense = {
  id: number
  type: string
  amount: number
  date: string // ISO string
  description?: string
  userId: number
}

interface ExpenseState {
  items: Expense[]
}

const initialState: ExpenseState = {
  items: [],
}

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    registerExpense: (state, action: PayloadAction<Expense>) => {
      state.items.push(action.payload)
    },
    deleteExpense: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(exp => exp.id !== action.payload)
    },
  },
})

export const { registerExpense, deleteExpense } = expenseSlice.actions
export default expenseSlice.reducer
