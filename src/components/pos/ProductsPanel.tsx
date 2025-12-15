import { useState, useEffect } from 'react';
import { Category, PosProduct, NavigationLevel } from '@/types/sale';
import { productsApi } from '@/services/products-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, X, Package, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductsPanelProps {
  onProductSelect: (product: PosProduct) => void;
}

export function ProductsPanel({ onProductSelect }: ProductsPanelProps) {
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('CATEGORIES');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load root categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await productsApi.getRootCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Грешка при зареждане на категории');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = async (category: Category) => {
    setIsLoading(true);
    try {
      const subs = await productsApi.getSubcategories(category.id);
      setSelectedCategory(category);
      
      if (subs.length > 0) {
        setSubcategories(subs);
        setCurrentLevel('SUBCATEGORIES');
      } else {
        const prods = await productsApi.getProductsByCategory(category.id);
        setProducts(prods);
        setCurrentLevel('PRODUCTS');
      }
    } catch (error) {
      toast.error('Грешка при зареждане');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubcategoryClick = async (subcategory: Category) => {
    setIsLoading(true);
    try {
      const prods = await productsApi.getProductsByCategory(subcategory.id);
      setSelectedSubcategory(subcategory);
      setProducts(prods);
      setCurrentLevel('PRODUCTS');
    } catch (error) {
      toast.error('Грешка при зареждане на продукти');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentLevel === 'PRODUCTS') {
      if (selectedSubcategory) {
        setSelectedSubcategory(null);
        setCurrentLevel('SUBCATEGORIES');
      } else {
        setSelectedCategory(null);
        setCurrentLevel('CATEGORIES');
      }
    } else if (currentLevel === 'SUBCATEGORIES') {
      setSelectedCategory(null);
      setCurrentLevel('CATEGORIES');
    }
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await productsApi.searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      toast.error('Грешка при търсене');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const getBreadcrumb = () => {
    if (searchQuery) return 'Търсене';
    if (currentLevel === 'CATEGORIES') return 'Категории';
    if (currentLevel === 'SUBCATEGORIES') return `Категория: ${selectedCategory?.name}`;
    if (currentLevel === 'PRODUCTS') {
      if (selectedSubcategory) {
        return `${selectedCategory?.name} → ${selectedSubcategory.name}`;
      }
      return `Категория: ${selectedCategory?.name}`;
    }
    return '';
  };

  const renderItem = (item: Category | PosProduct, isProduct: boolean = false) => {
    const product = isProduct ? (item as PosProduct) : null;
    
    return (
      <button
        key={item.id}
        onClick={() => {
          if (isProduct) {
            onProductSelect(item as PosProduct);
          } else if (currentLevel === 'CATEGORIES') {
            handleCategoryClick(item as Category);
          } else {
            handleSubcategoryClick(item as Category);
          }
        }}
        className={cn(
          "group flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-4 transition-all",
          "hover:border-primary hover:bg-primary/5 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <div className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full bg-muted transition-colors",
          "group-hover:bg-primary/10"
        )}>
          {isProduct ? (
            <Package className="h-10 w-10 text-muted-foreground group-hover:text-primary" />
          ) : (
            <Grid3X3 className="h-10 w-10 text-muted-foreground group-hover:text-primary" />
          )}
        </div>
        <span className="text-center text-sm font-medium">{item.name}</span>
        {product && (
          <span className="text-sm font-bold text-primary">{product.price.toFixed(2)} лв</span>
        )}
      </button>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (isLoading) return renderLoadingSkeleton();

    // Search mode
    if (searchQuery) {
      if (isSearching) return renderLoadingSkeleton();
      if (searchResults.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Няма намерени продукти</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {searchResults.map(product => renderItem(product, true))}
        </div>
      );
    }

    // Categories
    if (currentLevel === 'CATEGORIES') {
      return (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map(category => renderItem(category))}
        </div>
      );
    }

    // Subcategories
    if (currentLevel === 'SUBCATEGORIES') {
      return (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {subcategories.map(subcategory => renderItem(subcategory))}
        </div>
      );
    }

    // Products
    if (currentLevel === 'PRODUCTS') {
      if (products.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Няма продукти в тази категория</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map(product => renderItem(product, true))}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="flex h-full flex-col border-2 border-border/50 shadow-lg shadow-primary/5">
      <CardHeader className="flex-shrink-0 space-y-4 border-b bg-secondary/50 pb-4">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentLevel === 'CATEGORIES' && !searchQuery}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {getBreadcrumb()}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Търсене на продукт..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
