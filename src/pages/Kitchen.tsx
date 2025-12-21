import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ChefHat, Clock, CheckCircle2, Play, RefreshCw, Printer } from 'lucide-react';
import { ordersApi } from '@/services/orders-api';
import { Order, OrderStatus } from '@/types/order';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Чакаща', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-300' },
  IN_PROGRESS: { label: 'В изпълнение', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300' },
  READY: { label: 'Готова', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
  SERVED: { label: 'Сервирана', color: 'text-muted-foreground', bgColor: 'bg-muted border-muted' },
  CANCELLED: { label: 'Отказана', color: 'text-destructive', bgColor: 'bg-destructive/10 border-destructive/30' },
};

function getTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'сега';
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  return `${hours} ч ${minutes % 60} мин`;
}

export default function Kitchen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: ordersApi.getAll,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Статусът е обновен');
    },
    onError: () => {
      toast.error('Грешка при обновяване на статуса');
    },
  });

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return ['PENDING', 'IN_PROGRESS', 'READY'].includes(order.status);
    }
    return true;
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING');
  const inProgressOrders = filteredOrders.filter((o) => o.status === 'IN_PROGRESS');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');

  const handleStartOrder = (order: Order) => {
    updateStatusMutation.mutate({ id: order.id, status: 'IN_PROGRESS' });
  };

  const handleCompleteOrder = (order: Order) => {
    updateStatusMutation.mutate({ id: order.id, status: 'READY' });
  };

  const handlePrintOrder = (order: Order) => {
    const printContent = `
      <html>
        <head>
          <title>Поръчка #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; }
            h1 { font-size: 18px; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .table-name { font-size: 24px; font-weight: bold; margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #ccc; }
            .quantity { font-weight: bold; }
            .notes { margin-top: 15px; font-style: italic; padding: 10px; background: #f5f5f5; }
            .time { margin-top: 15px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Поръчка #${order.id}</h1>
          <div class="table-name">${order.tableName}</div>
          ${order.items.map(item => `
            <div class="item">
              <span><span class="quantity">${item.quantity}x</span> ${item.productName}</span>
            </div>
          `).join('')}
          ${order.notes ? `<div class="notes">Бележка: ${order.notes}</div>` : ''}
          <div class="time">Време: ${new Date(order.createdAt).toLocaleString('bg-BG')}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
    toast.success('Поръчката е изпратена за печат');
  };

  const OrderCard = ({ order, showActions = true }: { order: Order; showActions?: boolean }) => {
    const config = statusConfig[order.status];
    const timeAgo = getTimeAgo(order.createdAt);

    return (
      <Card className={cn('border-2 transition-all', config.bgColor)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{order.tableName}</CardTitle>
            <Badge variant="outline" className={cn('font-medium', config.color)}>
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeAgo}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  <span className="font-semibold">{item.quantity}x</span> {item.productName}
                </span>
              </div>
            ))}
          </div>
          {order.notes && (
            <p className="text-sm italic text-muted-foreground">Бележка: {order.notes}</p>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handlePrintOrder(order)}
              variant="outline"
              size="icon"
              title="Отпечатай"
            >
              <Printer className="h-4 w-4" />
            </Button>
            {showActions && order.status === 'PENDING' && (
              <Button
                onClick={() => handleStartOrder(order)}
                className="flex-1"
                disabled={updateStatusMutation.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                Започни
              </Button>
            )}
            {showActions && order.status === 'IN_PROGRESS' && (
              <Button
                onClick={() => handleCompleteOrder(order)}
                className="flex-1"
                variant="default"
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Готово
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Кухня</h1>
                <p className="text-sm text-muted-foreground">
                  {pendingOrders.length + inProgressOrders.length} активни поръчки
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Активни
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Всички
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <h2 className="text-lg font-semibold">Чакащи ({pendingOrders.length})</h2>
            </div>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {pendingOrders.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Няма чакащи поръчки
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <h2 className="text-lg font-semibold">В изпълнение ({inProgressOrders.length})</h2>
            </div>
            <div className="space-y-4">
              {inProgressOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {inProgressOrders.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Няма поръчки в изпълнение
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <h2 className="text-lg font-semibold">Готови ({readyOrders.length})</h2>
            </div>
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <OrderCard key={order.id} order={order} showActions={false} />
              ))}
              {readyOrders.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Няма готови поръчки
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
