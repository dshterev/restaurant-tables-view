import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billApi } from '@/services/bill-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Receipt, CreditCard, X, Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';
import { PaymentDialog, PaymentMethod } from '@/components/bill/PaymentDialog';

export default function Bill() {
  const { tableId } = useParams<{ tableId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const tableName = searchParams.get('name') || `Маса ${tableId}`;
  const tableIdNum = parseInt(tableId || '0', 10);

  // Fetch or create bill for table
  const { data: bill, isLoading } = useQuery({
    queryKey: ['bill', tableIdNum],
    queryFn: async () => {
      let existingBill = await billApi.getByTableId(tableIdNum);
      if (!existingBill) {
        existingBill = await billApi.createForTable(tableIdNum, tableName);
      }
      return existingBill;
    },
    enabled: tableIdNum > 0,
  });

  const payMutation = useMutation({
    mutationFn: (params: { method: PaymentMethod; cashAmount?: number; cardAmount?: number }) => 
      billApi.pay(bill!.id, params.method, params.cashAmount, params.cardAmount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bill', tableIdNum] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      
      const methodLabels = { CASH: 'в брой', CARD: 'с карта', SPLIT: 'смесено' };
      toast.success(`Сметката е платена ${methodLabels[variables.method]}`);
      setPaymentDialogOpen(false);
      navigate('/tables');
    },
    onError: () => {
      toast.error('Грешка при плащане');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => billApi.cancel(bill!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', tableIdNum] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      toast.success('Сметката е анулирана');
      navigate('/tables');
    },
    onError: () => {
      toast.error('Грешка при анулиране');
    },
  });

  const handlePaymentConfirm = (method: PaymentMethod, cashAmount?: number, cardAmount?: number) => {
    payMutation.mutate({ method, cashAmount, cardAmount });
  };

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

  if (!bill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">Сметката не е намерена</h2>
          <Button className="mt-4" onClick={() => navigate('/tables')}>
            Назад към масите
          </Button>
        </div>
      </div>
    );
  }

  const statusLabels = {
    OPEN: { label: 'Отворена', className: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
    PAID: { label: 'Платена', className: 'bg-primary/20 text-primary' },
    CANCELLED: { label: 'Анулирана', className: 'bg-destructive/20 text-destructive' },
  };

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
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Сметка #{bill.id}</h1>
                <p className="text-sm text-muted-foreground">{bill.tableName}</p>
              </div>
            </div>
            <Badge variant="outline" className={statusLabels[bill.status].className}>
              {statusLabels[bill.status].label}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Артикули</CardTitle>
                <Button size="sm" variant="outline" disabled={bill.status !== 'OPEN'}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добави
                </Button>
              </CardHeader>
              <CardContent>
                {bill.items.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Няма добавени артикули
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bill.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {item.unitPrice.toFixed(2)} лв.
                          </p>
                        </div>
                        <p className="font-semibold">{item.total.toFixed(2)} лв.</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Обобщение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Отворена {formatDistanceToNow(new Date(bill.openedAt), { addSuffix: true, locale: bg })}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Сума</span>
                    <span>{bill.subtotal.toFixed(2)} лв.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ДДС (20%)</span>
                    <span>{bill.tax.toFixed(2)} лв.</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Общо</span>
                    <span>{bill.total.toFixed(2)} лв.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bill.status === 'OPEN' && (
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Плати сметката
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Анулирай
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        total={bill.total}
        onConfirm={handlePaymentConfirm}
        isPending={payMutation.isPending}
      />
    </div>
  );
}
