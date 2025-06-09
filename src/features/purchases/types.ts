export interface PurchaseDetail {
    productId: number
    quantity: number
    unitPrice: number
  }
  
  export interface Purchase {
    id: number
    providerId: number
    date: string
    total: number
    details: PurchaseDetail[]
  }