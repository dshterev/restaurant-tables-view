import { TableStatus } from '@/types/restaurant-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TableFiltersProps {
  areas: string[];
  selectedArea: string | null;
  selectedStatus: TableStatus | null;
  onAreaChange: (area: string | null) => void;
  onStatusChange: (status: TableStatus | null) => void;
}

const statusOptions: { value: TableStatus; label: string; color: string }[] = [
  { value: 'FREE', label: 'Свободна', color: 'bg-emerald-500' },
  { value: 'OCCUPIED', label: 'Заета', color: 'bg-amber-500' },
  { value: 'RESERVED', label: 'Резервирана', color: 'bg-primary' },
  { value: 'DISABLED', label: 'Неактивна', color: 'bg-muted' },
];

export function TableFilters({
  areas,
  selectedArea,
  selectedStatus,
  onAreaChange,
  onStatusChange,
}: TableFiltersProps) {
  const hasFilters = selectedArea || selectedStatus;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={selectedArea || '__all__'}
        onValueChange={(v) => onAreaChange(v === '__all__' ? null : v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Всички зони" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Всички зони</SelectItem>
          {areas.map((area) => (
            <SelectItem key={area} value={area}>
              {area}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={selectedStatus === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(selectedStatus === opt.value ? null : opt.value)}
            className="gap-2"
          >
            <span className={`h-2 w-2 rounded-full ${opt.color}`} />
            {opt.label}
          </Button>
        ))}
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onAreaChange(null);
            onStatusChange(null);
          }}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Изчисти филтри
        </Button>
      )}
    </div>
  );
}
