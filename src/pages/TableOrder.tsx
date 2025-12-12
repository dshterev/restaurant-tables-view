import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/orders-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Send } from 'lucide-react';
import { Order, OrderItem } from '@/types/order';

// Mock menu items
const menuItems = [
  { id: 1, name: 'Пица Маргарита', price: 12.50, category: 'Пици' },
  { id: 2, name: 'Пица Капричоза', price: 14.00, category: 'Пици' },
  { id: 3, name: 'Цезар салата', price: 9.80, category: 'Салати' },
  { id: 4, name: 'Гръцка салата', price: 8.50, category: 'Салати' },
  { id: 5, name: 'Кока-Кола 0.5л', price: 3.50, category: 'Напитки' },
  { id: 6, name: 'Фанта 0.5л', price: 3.50, category: 'Напитки' },
  { id: 7, name: 'Минерална вода', price: 2.50, category: 'Напитки' },
  { id: 8, name: 'Тирамису', price: 7.00, category: 'Десерти' },
  { id: 9, name: 'Чийзкейк', price: 6.50, category: 'Десерти' },
];

export default function TableOrder() {
  const { tableId } = useParams<{ tableId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const tableName = searchParams.get('name') || `Маса ${tableId}`;
  const tableIdNum = parseInt(tableId || '0', 10);

  const [orderItems, setOrderItems] = useState<Array<{ menuItemId: number; name: string; quantity: number; price: number }>>([]);

  // Fetch existing order for table
  const { data: existingOrder, isLoading } = useQuery({
    queryKey: ['table-order', tableIdNum],
    queryFn: async () => {
      const orders = await ordersApi.getAll();
      return orders.find(o => o.tableId === tableIdNum && o.status !== 'SERVED') || null;
    },
    enabled: tableIdNum > 0,
  });

  // Initialize orderItems from existing order
  useState(() => {
    if (existingOrder) {
      setOrderItems(existingOrder.items.map(item => ({
        menuItemId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
      })));
    }
  });

  const addItem = (menuItem: typeof menuItems[0]) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem.id);
      if (existing) {
        return prev.map(i => 
          i.menuItemId === menuItem.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItemId: menuItem.id, name: menuItem.name, quantity: 1, price: menuItem.price }];
    });
  };

  const removeItem = (menuItemId: number) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => 
          i.menuItemId === menuItemId 
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prev.filter(i => i.menuItemId !== menuItemId);
    });
  };

  const deleteItem = (menuItemId: number) => {
    setOrderItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
  };

  const sendOrderMutation = useMutation({
    mutationFn: async () => {
      // Simulate sending order
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-order', tableIdNum] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      toast.success('Поръчката е изпратена към кухнята');
      navigate('/tables');
    },
    onError: () => {
      toast.error('Грешка при изпращане на поръчката');
    },
  });

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container py-4">
            <Skeleton className="h-10 w-48" />
          </div>
        </header>
        <div className="container py-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/tables')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Нова поръчка</h1>
                <p className="text-sm text-muted-foreground">{tableName}</p>
              </div>
            </div>
            {orderItems.length > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {total.toFixed(2)} лв.
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {menuItems
                      .filter(item => item.category === category)
                      .map(item => {
                        const inOrder = orderItems.find(oi => oi.menuItemId === item.id);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-secondary/10 transition-colors"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} лв.</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {inOrder ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{inOrder.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => addItem(item)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addItem(item)}
                                >
                                  <Plus className="mr-1 h-4 w-4" />
                                  Добави
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Текуща поръчка</CardTitle>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Няма добавени артикули
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.menuItemId} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {item.price.toFixed(2)} лв.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} лв.</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteItem(item.menuItemId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Общо</span>
                      <span>{total.toFixed(2)} лв.</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {orderItems.length > 0 && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => sendOrderMutation.mutate()}
                disabled={sendOrderMutation.isPending}
              >
                <Send className="mr-2 h-5 w-5" />
                Изпрати поръчка
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
