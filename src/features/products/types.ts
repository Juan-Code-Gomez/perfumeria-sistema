export interface Unit {
  id: number;
  name: string;
  symbol?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  unit: Unit;
  category: Category;
  stock: number;
  minStock?: number;
  purchasePrice: number;
  salePrice: number;
  imageUrl?: string;
  utilidad?: number;
  margen?: number;
}
