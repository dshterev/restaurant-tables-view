import { Bill, BillItem } from '@/types/bill';

// Mock data
const mockItems: BillItem[] = [
  { id: 1, name: 'Пица Маргарита', quantity: 2, unitPrice: 12.50, total: 25.00 },
  { id: 2, name: 'Цезар салата', quantity: 1, unitPrice: 9.80, total: 9.80 },
  { id: 3, name: 'Кока-Кола 0.5л', quantity: 3, unitPrice: 3.50, total: 10.50 },
  { id: 4, name: 'Тирамису', quantity: 2, unitPrice: 7.00, total: 14.00 },
];

const mockBills: Record<number, Bill> = {
  1001: {
    id: 1001,
    tableId: 1,
    tableName: 'Маса 1',
    items: mockItems,
    subtotal: 59.30,
    tax: 11.86,
    total: 71.16,
    openedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
  1002: {
    id: 1002,
    tableId: 3,
    tableName: 'Маса 3',
    items: mockItems.slice(0, 2),
    subtotal: 34.80,
    tax: 6.96,
    total: 41.76,
    openedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'OPEN',
  },
};

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const billApi = {
  getById: async (billId: number): Promise<Bill | null> => {
    await delay(300);
    return mockBills[billId] || null;
  },

  getByTableId: async (tableId: number): Promise<Bill | null> => {
    await delay(300);
    const bill = Object.values(mockBills).find((b) => b.tableId === tableId && b.status === 'OPEN');
    return bill || null;
  },

  createForTable: async (tableId: number, tableName: string): Promise<Bill> => {
    await delay(300);
    const newBill: Bill = {
      id: Date.now(),
      tableId,
      tableName,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      openedAt: new Date().toISOString(),
      status: 'OPEN',
    };
    mockBills[newBill.id] = newBill;
    return newBill;
  },

  addItem: async (billId: number, item: Omit<BillItem, 'id' | 'total'>): Promise<Bill> => {
    await delay(200);
    const bill = mockBills[billId];
    if (!bill) throw new Error('Bill not found');
    
    const newItem: BillItem = {
      id: Date.now(),
      ...item,
      total: item.quantity * item.unitPrice,
    };
    bill.items.push(newItem);
    bill.subtotal = bill.items.reduce((sum, i) => sum + i.total, 0);
    bill.tax = bill.subtotal * 0.2;
    bill.total = bill.subtotal + bill.tax;
    return bill;
  },

  pay: async (billId: number, method?: string, cashAmount?: number, cardAmount?: number): Promise<Bill> => {
    await delay(300);
    const bill = mockBills[billId];
    if (!bill) throw new Error('Bill not found');
    bill.status = 'PAID';
    // In real app, we'd store payment method and amounts
    console.log('Payment:', { method, cashAmount, cardAmount });
    return bill;
  },

  cancel: async (billId: number): Promise<Bill> => {
    await delay(300);
    const bill = mockBills[billId];
    if (!bill) throw new Error('Bill not found');
    bill.status = 'CANCELLED';
    return bill;
  },
};
