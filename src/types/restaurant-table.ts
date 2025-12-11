export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'DISABLED';

export interface RestaurantTable {
  id: number;
  storeId: number;
  name: string;
  area: string;
  seats: number;
  status: TableStatus;
  currentSaleId: number | null;
  currentSaleTotal: number | null;
  openedAt: string | null;
}

export interface CreateTableDto {
  name: string;
  area: string;
  seats: number;
  status?: TableStatus;
}

export interface UpdateTableDto extends Partial<CreateTableDto> {
  id: number;
}
