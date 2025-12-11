import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RestaurantTable, TableStatus, CreateTableDto } from '@/types/restaurant-table';
import { restaurantTablesApi } from '@/services/restaurant-tables-api';
import { TableCard } from '@/components/restaurant/TableCard';
import { TableDialog } from '@/components/restaurant/TableDialog';
import { TableFilters } from '@/components/restaurant/TableFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, LayoutGrid, RefreshCw, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RestaurantTables() {
  const [isAdmin] = useState(true); // In real app, this would come from auth context
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  const queryClient = useQueryClient();

  // Fetch tables
  const { data: tables = [], isLoading, refetch } = useQuery({
    queryKey: ['restaurant-tables'],
    queryFn: () => restaurantTablesApi.getAll(1),
  });

  // Fetch areas
  const { data: areas = [] } = useQuery({
    queryKey: ['restaurant-areas'],
    queryFn: () => restaurantTablesApi.getAreas(1),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CreateTableDto & { id?: number }) => {
      if (data.id) {
        return restaurantTablesApi.update({ ...data, id: data.id });
      }
      return restaurantTablesApi.create(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-areas'] });
      toast.success(variables.id ? 'Масата е обновена' : 'Масата е създадена');
    },
    onError: () => {
      toast.error('Възникна грешка');
    },
  });

  // Disable mutation
  const disableMutation = useMutation({
    mutationFn: restaurantTablesApi.disable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] });
      toast.success('Масата е деактивирана');
    },
    onError: () => {
      toast.error('Възникна грешка');
    },
  });

  // Filter tables
  const filteredTables = tables.filter((table) => {
    if (selectedArea && table.area !== selectedArea) return false;
    if (selectedStatus && table.status !== selectedStatus) return false;
    return true;
  });

  // Handlers
  const handleOpenBill = (table: RestaurantTable) => {
    toast.info(`Отваряне на сметка за ${table.name}`, {
      description: `Сметка #${table.currentSaleId} - ${table.currentSaleTotal?.toFixed(2)} лв.`,
    });
  };

  const handleOpenOrder = (table: RestaurantTable) => {
    toast.info(`Отваряне на поръчка за ${table.name}`);
  };

  const handleEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setDialogOpen(true);
  };

  const handleNewTable = () => {
    setEditingTable(null);
    setDialogOpen(true);
  };

  // Stats
  const stats = {
    total: tables.length,
    free: tables.filter((t) => t.status === 'FREE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Маси</h1>
                <p className="text-sm text-muted-foreground">
                  Управление на ресторантски маси
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/orders">
                <Button variant="outline" size="sm">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Поръчки
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Обнови
              </Button>
              {isAdmin && (
                <Button onClick={handleNewTable}>
                  <Plus className="mr-2 h-4 w-4" />
                  Нова маса
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="border-b bg-card/50">
        <div className="container py-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Общо:</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Свободни:</span>
              <span className="font-medium">{stats.free}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Заети:</span>
              <span className="font-medium">{stats.occupied}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Резервирани:</span>
              <span className="font-medium">{stats.reserved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container py-4">
        <TableFilters
          areas={areas}
          selectedArea={selectedArea}
          selectedStatus={selectedStatus}
          onAreaChange={setSelectedArea}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {/* Table Grid */}
      <div className="container pb-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Няма намерени маси</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedArea || selectedStatus
                ? 'Опитайте с различни филтри'
                : 'Създайте първата маса'}
            </p>
            {isAdmin && !selectedArea && !selectedStatus && (
              <Button className="mt-4" onClick={handleNewTable}>
                <Plus className="mr-2 h-4 w-4" />
                Нова маса
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                isAdmin={isAdmin}
                onOpenBill={handleOpenBill}
                onOpenOrder={handleOpenOrder}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin Dialog */}
      {isAdmin && (
        <TableDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          table={editingTable}
          areas={areas}
          onSave={saveMutation.mutateAsync}
          onDisable={disableMutation.mutateAsync}
        />
      )}
    </div>
  );
}
