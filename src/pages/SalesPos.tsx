import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sale, SaleItem, PosProduct } from '@/types/sale';
import { salesApi } from '@/services/sales-api';
import { OrderItemsPanel } from '@/components/pos/OrderItemsPanel';
import { ProductsPanel } from '@/components/pos/ProductsPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const STORE_ID = 1; // TODO: Get from context/auth

export default function SalesPos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tableId = searchParams.get('tableId');
  const saleId = searchParams.get('saleId');
  const tableName = searchParams.get('tableName');
  
  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sale
  useEffect(() => {
    const loadSale = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let loadedSale: Sale;
        
        if (saleId) {
          loadedSale = await salesApi.getById(Number(saleId));
        } else if (tableId) {
          loadedSale = await salesApi.openForTable(Number(tableId), STORE_ID);
          if (tableName) {
            loadedSale.tableName = tableName;
          }
        } else {
          setError('Няма избрана маса или сметка');
          setIsLoading(false);
          return;
        }
        
        setSale(loadedSale);
        setItems(loadedSale.items || []);
      } catch (err) {
        console.error('Error loading sale:', err);
        setError('Грешка при зареждане на сметката');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSale();
  }, [saleId, tableId, tableName]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sale) throw new Error('No sale');
      return salesApi.updateItems(sale.id, items);
    },
    onSuccess: (updatedSale) => {
      setSale(updatedSale);
      setItems(updatedSale.items);
      toast.success('Поръчката е записана');
    },
    onError: () => {
      toast.error('Грешка при запис на поръчката');
    },
  });

  // Handle product selection
  const handleProductSelect = useCallback((product: PosProduct) => {
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(item => item.productId === product.id);
      
      if (existingIndex >= 0) {
        // Increase quantity
        const newItems = [...currentItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
          lineTotal: (newItems[existingIndex].quantity + 1) * newItems[existingIndex].unitPrice,
        };
        return newItems;
      } else {
        // Add new item
        const newItem: SaleItem = {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          unitPrice: product.price,
          discount: 0,
          lineTotal: product.price,
        };
        return [...currentItems, newItem];
      }
    });
  }, []);

  // Handle quantity update
  const handleUpdateQuantity = useCallback((productId: number, delta: number) => {
    setItems(currentItems => {
      const newItems = currentItems.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) {
            return null;
          }
          return {
            ...item,
            quantity: newQuantity,
            lineTotal: newQuantity * item.unitPrice - (item.discount || 0),
          };
        }
        return item;
      }).filter(Boolean) as SaleItem[];
      
      return newItems;
    });
  }, []);

  // Handle item removal
  const handleRemoveItem = useCallback((productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
  }, []);

  // Handle save
  const handleSave = () => {
    saveMutation.mutate();
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/tables');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen gap-4 bg-background p-4">
        <div className="w-[40%]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="w-[60%]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <h2 className="text-xl font-semibold">{error}</h2>
          <Button onClick={() => navigate('/tables')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад към маси
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen gap-4 bg-background p-4">
      {/* Left Panel - Order Items */}
      <div className="w-[40%]">
        <OrderItemsPanel
          sale={sale}
          items={items}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onSave={handleSave}
          onBack={handleBack}
          isSaving={saveMutation.isPending}
        />
      </div>

      {/* Right Panel - Products */}
      <div className="w-[60%]">
        <ProductsPanel onProductSelect={handleProductSelect} />
      </div>
    </div>
  );
}
