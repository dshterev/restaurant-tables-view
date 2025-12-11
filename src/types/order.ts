export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: number;
  tableId: number;
  tableName: string;
  storeId: number;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  servedAt?: string;
  notes?: string;
}

export interface OrderFilters {
  status: OrderStatus | 'ALL';
  tableId: number | null;
}
