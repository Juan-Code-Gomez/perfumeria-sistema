export interface SaleData {
  customerName?: string
  totalAmount: number
  paidAmount: number
  isPaid: boolean
  details: {
    productId: number
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

export interface Sale {
  id: number
  customerName?: string
  date: string
  totalAmount: number
  paidAmount: number
  details: {
    product: { name: string }
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}