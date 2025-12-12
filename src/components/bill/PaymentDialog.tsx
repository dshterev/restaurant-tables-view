import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Banknote, CreditCard, Split } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'CASH' | 'CARD' | 'SPLIT';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: (method: PaymentMethod, cashAmount?: number, cardAmount?: number) => void;
  isPending?: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  total,
  onConfirm,
  isPending,
}: PaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [cashAmount, setCashAmount] = useState<string>(total.toFixed(2));
  const [cardAmount, setCardAmount] = useState<string>('0.00');

  const handleMethodChange = (value: PaymentMethod) => {
    setMethod(value);
    if (value === 'CASH') {
      setCashAmount(total.toFixed(2));
      setCardAmount('0.00');
    } else if (value === 'CARD') {
      setCashAmount('0.00');
      setCardAmount(total.toFixed(2));
    } else {
      setCashAmount((total / 2).toFixed(2));
      setCardAmount((total / 2).toFixed(2));
    }
  };

  const handleCashChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCashAmount(value);
    if (method === 'SPLIT') {
      const remaining = Math.max(0, total - numValue);
      setCardAmount(remaining.toFixed(2));
    }
  };

  const handleCardChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setCardAmount(value);
    if (method === 'SPLIT') {
      const remaining = Math.max(0, total - numValue);
      setCashAmount(remaining.toFixed(2));
    }
  };

  const handleConfirm = () => {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    onConfirm(method, cash, card);
  };

  const splitTotal = (parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0);
  const isValidSplit = method !== 'SPLIT' || Math.abs(splitTotal - total) < 0.01;

  const paymentOptions = [
    { value: 'CASH' as const, label: 'В брой', icon: Banknote },
    { value: 'CARD' as const, label: 'С карта', icon: CreditCard },
    { value: 'SPLIT' as const, label: 'Смесено', icon: Split },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Метод на плащане</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total */}
          <div className="rounded-lg bg-secondary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground">Сума за плащане</p>
            <p className="text-3xl font-bold">{total.toFixed(2)} лв.</p>
          </div>

          {/* Payment Method Selection */}
          <RadioGroup
            value={method}
            onValueChange={(v) => handleMethodChange(v as PaymentMethod)}
            className="grid grid-cols-3 gap-3"
          >
            {paymentOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-secondary/10',
                  method === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <option.icon
                  className={cn(
                    'h-6 w-6',
                    method === option.value ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    method === option.value ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {option.label}
                </span>
              </Label>
            ))}
          </RadioGroup>

          {/* Split Payment Fields */}
          {method === 'SPLIT' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cash-amount" className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    В брой
                  </Label>
                  <div className="relative">
                    <Input
                      id="cash-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={total}
                      value={cashAmount}
                      onChange={(e) => handleCashChange(e.target.value)}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      лв.
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-amount" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    С карта
                  </Label>
                  <div className="relative">
                    <Input
                      id="card-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={total}
                      value={cardAmount}
                      onChange={(e) => handleCardChange(e.target.value)}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      лв.
                    </span>
                  </div>
                </div>

                {!isValidSplit && (
                  <p className="text-sm text-destructive">
                    Сумите трябва да са равни на {total.toFixed(2)} лв. (текущо: {splitTotal.toFixed(2)} лв.)
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отказ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !isValidSplit}
          >
            {isPending ? 'Обработка...' : 'Потвърди плащане'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
