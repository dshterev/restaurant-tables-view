import { useState, useEffect } from 'react';
import { RestaurantTable, CreateTableDto, TableStatus } from '@/types/restaurant-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: RestaurantTable | null;
  areas: string[];
  onSave: (data: CreateTableDto & { id?: number }) => Promise<unknown>;
  onDisable?: (id: number) => Promise<unknown>;
}

const statusOptions: { value: TableStatus; label: string }[] = [
  { value: 'FREE', label: 'Свободна' },
  { value: 'OCCUPIED', label: 'Заета' },
  { value: 'RESERVED', label: 'Резервирана' },
  { value: 'DISABLED', label: 'Неактивна' },
];

export function TableDialog({ open, onOpenChange, table, areas, onSave, onDisable }: TableDialogProps) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [seats, setSeats] = useState(4);
  const [status, setStatus] = useState<TableStatus>('FREE');
  const [loading, setLoading] = useState(false);

  const isEditing = !!table;

  useEffect(() => {
    if (table) {
      setName(table.name);
      setArea(table.area);
      setSeats(table.seats);
      setStatus(table.status);
      setCustomArea('');
    } else {
      setName('');
      setArea(areas[0] || '');
      setSeats(4);
      setStatus('FREE');
      setCustomArea('');
    }
  }, [table, areas, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        id: table?.id,
        name,
        area: customArea || area,
        seats,
        status,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!table || !onDisable) return;
    setLoading(true);
    try {
      await onDisable(table.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактиране на маса' : 'Нова маса'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Променете данните за масата и запазете.'
              : 'Попълнете данните за новата маса.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Име на маса</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Маса 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Зона</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger>
                <SelectValue placeholder="Изберете зона" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">+ Нова зона</SelectItem>
              </SelectContent>
            </Select>
            {area === '__custom__' && (
              <Input
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                placeholder="Име на нова зона"
                className="mt-2"
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">Брой места</Label>
            <Input
              id="seats"
              type="number"
              min={1}
              max={20}
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TableStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && table?.status !== 'DISABLED' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDisable}
                disabled={loading}
              >
                Деактивирай
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Запази' : 'Създай'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
