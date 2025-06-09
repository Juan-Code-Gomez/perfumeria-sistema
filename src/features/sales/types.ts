export interface SaleProductDetail {
    productId: number
    quantity: number
    unitPrice: number
  }
  
  export interface Sale {
    id: number
    date: string
    clientName?: string
    paymentMethod: 'efectivo' | 'transferencia' | 'otro'
    userId: number
    total: number
    details: SaleProductDetail[]
  }