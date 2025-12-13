export type SaleStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export interface SaleItem {
  id?: number | null;
  productId: number;
  productName: string;
  productSku?: string | null;
  quantity: number;
  unitPrice: number;
  discount?: number | null;
  vatRate?: number | null;
  lineTotal: number;
  note?: string | null;
  sentToKitchen?: boolean | null;
}

export interface Sale {
  id: number;
  storeId: number;
  tableId: number;
  tableName?: string | null;
  userId?: number | null;
  userName?: string | null;
  status: SaleStatus;
  createdAt?: string | null;
  openedAt?: string | null;
  subtotal?: number | null;
  vatTotal?: number | null;
  total: number;
  items: SaleItem[];
}

export interface PosProduct {
  id: number;
  name: string;
  sku?: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  imageUrl?: string | null;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  imageUrl?: string | null;
}

export type NavigationLevel = 'CATEGORIES' | 'SUBCATEGORIES' | 'PRODUCTS';
