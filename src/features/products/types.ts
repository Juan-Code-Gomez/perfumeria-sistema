export interface Product {
    id: number
    name: string
    description?: string
    unit: 'ml' | 'gr' | 'unit'
    stock: number
    purchasePrice: number
    salePrice: number
  }