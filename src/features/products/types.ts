export interface Unit {
  id: number;
  name: string;
  symbol?: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  unitId: number;
  stock: number;
  minStock?: number;
  purchasePrice: number;
  salePrice: number;
  imageUrl?: string;
  utilidad?: number;
  margen?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  unit?: Unit;
  category?: Category;
}
