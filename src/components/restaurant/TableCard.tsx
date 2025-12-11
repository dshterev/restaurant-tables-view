import { RestaurantTable, TableStatus } from '@/types/restaurant-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Receipt, ShoppingCart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';

interface TableCardProps {
  table: RestaurantTable;
  isAdmin?: boolean;
  onOpenBill: (table: RestaurantTable) => void;
  onOpenOrder: (table: RestaurantTable) => void;
  onEdit?: (table: RestaurantTable) => void;
}

const statusConfig: Record<TableStatus, { label: string; className: string }> = {
  FREE: { label: 'Свободна', className: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  OCCUPIED: { label: 'Заета', className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  RESERVED: { label: 'Резервирана', className: 'bg-primary/20 text-primary border-primary/30' },
  DISABLED: { label: 'Неактивна', className: 'bg-muted text-muted-foreground border-muted' },
};

const cardStatusStyles: Record<TableStatus, string> = {
  FREE: 'border-l-4 border-l-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10',
  OCCUPIED: 'border-l-4 border-l-amber-500 hover:shadow-lg hover:shadow-amber-500/10',
  RESERVED: 'border-l-4 border-l-primary hover:shadow-lg hover:shadow-primary/10',
  DISABLED: 'border-l-4 border-l-muted opacity-60',
};

export function TableCard({ table, isAdmin, onOpenBill, onOpenOrder, onEdit }: TableCardProps) {
  const status = statusConfig[table.status];
  const cardStyle = cardStatusStyles[table.status];
  const isDisabled = table.status === 'DISABLED';

  return (
    <Card className={cn('transition-all duration-200', cardStyle)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{table.name}</h3>
            <p className="text-sm text-muted-foreground">{table.area}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('text-xs', status.className)}>
              {status.label}
            </Badge>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit?.(table)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{table.seats} места</span>
          </div>
          {table.openedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(table.openedAt), { addSuffix: true, locale: bg })}</span>
            </div>
          )}
        </div>

        {table.currentSaleTotal !== null && (
          <div className="rounded-md bg-secondary/10 p-3">
            <p className="text-sm text-muted-foreground">Текуща сметка</p>
            <p className="text-2xl font-bold text-foreground">
              {table.currentSaleTotal.toFixed(2)} лв.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {table.status === 'OCCUPIED' ? (
            <Button
              className="flex-1"
              onClick={() => onOpenBill(table)}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Отвори сметка
            </Button>
          ) : (
            <Button
              className="flex-1"
              disabled={isDisabled}
              onClick={() => onOpenOrder(table)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Отвори поръчка
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
