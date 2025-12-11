import { OrderFilters as Filters, OrderStatus } from '@/types/order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const statusOptions: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Всички статуси' },
  { value: 'PENDING', label: 'Чакащи' },
  { value: 'IN_PROGRESS', label: 'Готвят се' },
  { value: 'READY', label: 'Готови' },
  { value: 'SERVED', label: 'Сервирани' },
  { value: 'CANCELLED', label: 'Отказани' },
];

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value as OrderStatus | 'ALL' })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
