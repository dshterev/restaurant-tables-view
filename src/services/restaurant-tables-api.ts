import { RestaurantTable, CreateTableDto, UpdateTableDto, TableStatus } from '@/types/restaurant-table';

// Mock data for demonstration
const mockTables: RestaurantTable[] = [
  { id: 1, storeId: 1, name: 'Маса 1', area: 'Зала', seats: 4, status: 'FREE', currentSaleId: null, currentSaleTotal: null, openedAt: null },
  { id: 2, storeId: 1, name: 'Маса 2', area: 'Зала', seats: 2, status: 'OCCUPIED', currentSaleId: 123, currentSaleTotal: 45.80, openedAt: '2025-01-01T18:32:00Z' },
  { id: 3, storeId: 1, name: 'Маса 3', area: 'Зала', seats: 6, status: 'RESERVED', currentSaleId: null, currentSaleTotal: null, openedAt: null },
  { id: 4, storeId: 1, name: 'Маса 4', area: 'Тераса', seats: 4, status: 'FREE', currentSaleId: null, currentSaleTotal: null, openedAt: null },
  { id: 5, storeId: 1, name: 'Маса 5', area: 'Тераса', seats: 8, status: 'OCCUPIED', currentSaleId: 124, currentSaleTotal: 128.50, openedAt: '2025-01-01T17:15:00Z' },
  { id: 6, storeId: 1, name: 'Маса 6', area: 'Тераса', seats: 2, status: 'DISABLED', currentSaleId: null, currentSaleTotal: null, openedAt: null },
  { id: 7, storeId: 1, name: 'Маса 7', area: 'VIP', seats: 10, status: 'FREE', currentSaleId: null, currentSaleTotal: null, openedAt: null },
  { id: 8, storeId: 1, name: 'Маса 8', area: 'VIP', seats: 6, status: 'OCCUPIED', currentSaleId: 125, currentSaleTotal: 320.00, openedAt: '2025-01-01T19:00:00Z' },
  { id: 9, storeId: 1, name: 'Маса 9', area: 'Зала', seats: 4, status: 'FREE', currentSaleId: null, currentSaleTotal: null, openedAt: null },
  { id: 10, storeId: 1, name: 'Маса 10', area: 'Бар', seats: 2, status: 'OCCUPIED', currentSaleId: 126, currentSaleTotal: 22.00, openedAt: '2025-01-01T20:10:00Z' },
  { id: 11, storeId: 1, name: 'Маса 11', area: 'Бар', seats: 2, status: 'FREE', currentSaleId: null, currentSaleTotal: null, openedAt: null },
  { id: 12, storeId: 1, name: 'Маса 12', area: 'Бар', seats: 4, status: 'RESERVED', currentSaleId: null, currentSaleTotal: null, openedAt: null },
];

let tables = [...mockTables];
let nextId = 13;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const restaurantTablesApi = {
  // GET /api/restaurant-tables
  async getAll(storeId: number = 1): Promise<RestaurantTable[]> {
    await delay(300);
    return tables.filter(t => t.storeId === storeId);
  },

  // GET /api/restaurant-tables/:id
  async getById(id: number): Promise<RestaurantTable | null> {
    await delay(200);
    return tables.find(t => t.id === id) || null;
  },

  // POST /api/restaurant-tables
  async create(dto: CreateTableDto, storeId: number = 1): Promise<RestaurantTable> {
    await delay(300);
    const newTable: RestaurantTable = {
      id: nextId++,
      storeId,
      name: dto.name,
      area: dto.area,
      seats: dto.seats,
      status: dto.status || 'FREE',
      currentSaleId: null,
      currentSaleTotal: null,
      openedAt: null,
    };
    tables.push(newTable);
    return newTable;
  },

  // PUT /api/restaurant-tables/:id
  async update(dto: UpdateTableDto): Promise<RestaurantTable> {
    await delay(300);
    const index = tables.findIndex(t => t.id === dto.id);
    if (index === -1) throw new Error('Table not found');
    
    tables[index] = { ...tables[index], ...dto };
    return tables[index];
  },

  // DELETE /api/restaurant-tables/:id (soft delete - sets status to DISABLED)
  async disable(id: number): Promise<void> {
    await delay(200);
    const index = tables.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Table not found');
    tables[index].status = 'DISABLED';
  },

  // PATCH /api/restaurant-tables/:id/status
  async updateStatus(id: number, status: TableStatus): Promise<RestaurantTable> {
    await delay(200);
    const index = tables.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Table not found');
    tables[index].status = status;
    return tables[index];
  },

  // Get unique areas
  async getAreas(storeId: number = 1): Promise<string[]> {
    await delay(100);
    const areas = new Set(tables.filter(t => t.storeId === storeId).map(t => t.area));
    return Array.from(areas);
  },
};
