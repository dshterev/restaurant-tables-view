import { useState, useEffect, useMemo } from 'react';
import { Order, OrderFilters as Filters, OrderStatus } from '@/types/order';
import { ordersApi } from '@/services/orders-api';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ status: 'ALL', tableId: null });
  const { toast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch {
      toast({ title: 'Грешка', description: 'Неуспешно зареждане на поръчките', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    try {
      const updated = await ordersApi.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      toast({ title: 'Успех', description: 'Статусът е променен' });
    } catch {
      toast({ title: 'Грешка', description: 'Неуспешна промяна', variant: 'destructive' });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filters.status !== 'ALL' && order.status !== filters.status) return false;
      if (filters.tableId && order.tableId !== filters.tableId) return false;
      return true;
    });
  }, [orders, filters]);

  const stats = useMemo(() => ({
    pending: orders.filter(o => o.status === 'PENDING').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    ready: orders.filter(o => o.status === 'READY').length,
  }), [orders]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/tables">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Поръчки</h1>
            </div>
            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обнови
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <OrderFilters filters={filters} onFiltersChange={setFilters} />
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-secondary">{stats.pending} чакащи</span>
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground">{stats.inProgress} готвят се</span>
            <span className="px-3 py-1 rounded-full bg-accent">{stats.ready} готови</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Зареждане...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Няма поръчки</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
