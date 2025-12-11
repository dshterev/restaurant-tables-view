import { Order, OrderStatus } from '@/types/order';

const mockOrders: Order[] = [
  {
    id: 1,
    tableId: 1,
    tableName: 'Маса 1',
    storeId: 1,
    status: 'PENDING',
    items: [
      { id: 1, productId: 101, productName: 'Пица Маргарита', quantity: 2, unitPrice: 12.50, total: 25.00 },
      { id: 2, productId: 102, productName: 'Кока-Кола', quantity: 2, unitPrice: 3.00, total: 6.00 },
    ],
    total: 31.00,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 2,
    tableId: 3,
    tableName: 'Маса 3',
    storeId: 1,
    status: 'IN_PROGRESS',
    items: [
      { id: 3, productId: 103, productName: 'Спагети Карбонара', quantity: 1, unitPrice: 14.00, total: 14.00 },
      { id: 4, productId: 104, productName: 'Салата Цезар', quantity: 1, unitPrice: 9.50, total: 9.50 },
    ],
    total: 23.50,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 3,
    tableId: 5,
    tableName: 'Маса 5',
    storeId: 1,
    status: 'READY',
    items: [
      { id: 5, productId: 105, productName: 'Бургер Класик', quantity: 3, unitPrice: 11.00, total: 33.00 },
      { id: 6, productId: 106, productName: 'Пържени картофи', quantity: 3, unitPrice: 5.00, total: 15.00 },
    ],
    total: 48.00,
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 4,
    tableId: 2,
    tableName: 'Маса 2',
    storeId: 1,
    status: 'SERVED',
    items: [
      { id: 7, productId: 107, productName: 'Риба на скара', quantity: 2, unitPrice: 18.00, total: 36.00 },
    ],
    total: 36.00,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    servedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockOrders];
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'SERVED') order.servedAt = new Date().toISOString();
    return { ...order };
  },
};
