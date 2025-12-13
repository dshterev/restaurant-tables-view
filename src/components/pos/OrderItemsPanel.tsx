import { Sale, SaleItem } from '@/types/sale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Minus, Plus, Trash2, Save, CreditCard, XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItemsPanelProps {
  sale: Sale | null;
  items: SaleItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export function OrderItemsPanel({
  sale,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onSave,
  onBack,
  isSaving,
}: OrderItemsPanelProps) {
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-shrink-0 border-b pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Маси
          </Button>
          <div className="text-right">
            <CardTitle className="text-lg">
              {sale?.tableName || `Маса ${sale?.tableId}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Статус: <span className="font-medium text-primary">{sale?.status || 'OPEN'}</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-0">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">Няма добавени артикули</p>
            <p className="text-sm text-muted-foreground">Изберете продукти от менюто</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Продукт</TableHead>
                <TableHead className="text-center">Кол.</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="text-right">Общо</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{item.productName}</p>
                      {item.note && (
                        <p className="text-xs text-muted-foreground">{item.note}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice.toFixed(2)} лв
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.lineTotal.toFixed(2)} лв
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onRemoveItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CardFooter className="flex-shrink-0 flex-col gap-4 border-t pt-4">
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-medium">Общо:</span>
          <span className="text-2xl font-bold text-primary">{total.toFixed(2)} лв</span>
        </div>
        
        <div className="grid w-full grid-cols-3 gap-2">
          <Button
            onClick={onSave}
            disabled={items.length === 0 || isSaving}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Запази
          </Button>
          <Button
            variant="secondary"
            disabled
            className="w-full"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Плащане
          </Button>
          <Button
            variant="outline"
            disabled
            className="w-full text-destructive hover:bg-destructive/10"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Анулиране
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
