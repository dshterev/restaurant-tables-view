export interface BillItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Bill {
  id: number;
  tableId: number;
  tableName: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  openedAt: string;
  status: 'OPEN' | 'PAID' | 'CANCELLED';
}
