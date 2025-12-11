import { Order, OrderStatus } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, CheckCircle, XCircle } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: number, status: OrderStatus) => void;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  PENDING: { label: 'Чакаща', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: 'Готви се', variant: 'default', icon: <ChefHat className="h-3 w-3" /> },
  READY: { label: 'Готова', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
  SERVED: { label: 'Сервирана', variant: 'secondary', icon: <CheckCircle className="h-3 w-3" /> },
  CANCELLED: { label: 'Отказана', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

const getTimeAgo = (dateString: string) => {
  const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (minutes < 1) return 'Току-що';
  if (minutes < 60) return `${minutes} мин`;
  return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
};

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const config = statusConfig[order.status];
  
  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'READY',
    READY: 'SERVED',
  };

  const nextAction: Partial<Record<OrderStatus, string>> = {
    PENDING: 'Започни',
    IN_PROGRESS: 'Готово',
    READY: 'Сервирай',
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.tableName}</CardTitle>
          <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Поръчка #{order.id} • {getTimeAgo(order.createdAt)}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <div className="flex-1 space-y-1">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.productName}</span>
              <span className="text-muted-foreground">{item.total.toFixed(2)} лв</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 flex items-center justify-between font-medium">
          <span>Общо:</span>
          <span>{order.total.toFixed(2)} лв</span>
        </div>
        {nextStatus[order.status] && (
          <Button 
            className="w-full" 
            onClick={() => onStatusChange(order.id, nextStatus[order.status]!)}
          >
            {nextAction[order.status]}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
