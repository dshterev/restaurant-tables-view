import { Sale, SaleItem } from '@/types/sale';

const API_BASE = '/api/sales';

// Mock data for development
const mockSale: Sale = {
  id: 1,
  storeId: 1,
  tableId: 1,
  tableName: 'Маса 1',
  userId: 1,
  userName: 'Сервитьор 1',
  status: 'OPEN',
  createdAt: new Date().toISOString(),
  openedAt: new Date().toISOString(),
  subtotal: 0,
  vatTotal: 0,
  total: 0,
  items: [],
};

export const salesApi = {
  openForTable: async (tableId: number, storeId: number): Promise<Sale> => {
    // TODO: Replace with actual API call
    // POST /api/sales/open-for-table { tableId, storeId }
    console.log('Opening sale for table:', tableId, 'store:', storeId);
    return {
      ...mockSale,
      id: Date.now(),
      tableId,
      storeId,
      tableName: `Маса ${tableId}`,
    };
  },

  getById: async (id: number): Promise<Sale> => {
    // TODO: Replace with actual API call
    // GET /api/sales/{id}
    console.log('Getting sale:', id);
    return {
      ...mockSale,
      id,
    };
  },

  updateItems: async (saleId: number, items: SaleItem[]): Promise<Sale> => {
    // TODO: Replace with actual API call
    // PUT /api/sales/{saleId}/items
    console.log('Updating items for sale:', saleId, items);
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    return {
      ...mockSale,
      id: saleId,
      items,
      total,
      subtotal: total,
    };
  },
};
