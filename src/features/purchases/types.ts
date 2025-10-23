export interface PurchaseDetail {
    productId: number
    quantity: number
    unitCost: number
  }
  
  export interface Purchase {
    id: number
    supplierId: number
    date: string
    subtotal: number
    discount: number
    totalAmount: number
    paidAmount: number
    isPaid: boolean
    // Campos de factura (opcionales)
    invoiceNumber?: string
    invoiceDate?: string
    dueDate?: string
    notes?: string
    // Relaciones
    supplier?: { id: number; name: string }
    details: PurchaseDetail[]
  }