import { Category, PosProduct } from '@/types/sale';

// Mock data for development
const mockCategories: Category[] = [
  { id: 1, name: 'Пица', parentId: null },
  { id: 2, name: 'Паста', parentId: null },
  { id: 3, name: 'Салати', parentId: null },
  { id: 4, name: 'Напитки', parentId: null },
  { id: 5, name: 'Десерти', parentId: null },
  { id: 6, name: 'Класически пици', parentId: 1 },
  { id: 7, name: 'Специални пици', parentId: 1 },
  { id: 8, name: 'Спагети', parentId: 2 },
  { id: 9, name: 'Пене', parentId: 2 },
  { id: 10, name: 'Безалкохолни', parentId: 4 },
  { id: 11, name: 'Алкохолни', parentId: 4 },
];

const mockProducts: PosProduct[] = [
  { id: 1, name: 'Маргарита', price: 12.00, categoryId: 6, categoryName: 'Класически пици' },
  { id: 2, name: 'Капричоза', price: 14.00, categoryId: 6, categoryName: 'Класически пици' },
  { id: 3, name: 'Пеперони', price: 13.50, categoryId: 6, categoryName: 'Класически пици' },
  { id: 4, name: 'Кватро Формаджи', price: 16.00, categoryId: 7, categoryName: 'Специални пици' },
  { id: 5, name: 'Калцоне', price: 15.00, categoryId: 7, categoryName: 'Специални пици' },
  { id: 6, name: 'Спагети Болонезе', price: 11.00, categoryId: 8, categoryName: 'Спагети' },
  { id: 7, name: 'Спагети Карбонара', price: 12.50, categoryId: 8, categoryName: 'Спагети' },
  { id: 8, name: 'Пене Арабиата', price: 10.50, categoryId: 9, categoryName: 'Пене' },
  { id: 9, name: 'Цезар салата', price: 9.00, categoryId: 3, categoryName: 'Салати' },
  { id: 10, name: 'Гръцка салата', price: 8.50, categoryId: 3, categoryName: 'Салати' },
  { id: 11, name: 'Кока-Кола', price: 3.00, categoryId: 10, categoryName: 'Безалкохолни' },
  { id: 12, name: 'Фанта', price: 3.00, categoryId: 10, categoryName: 'Безалкохолни' },
  { id: 13, name: 'Минерална вода', price: 2.00, categoryId: 10, categoryName: 'Безалкохолни' },
  { id: 14, name: 'Бира Загорка', price: 4.00, categoryId: 11, categoryName: 'Алкохолни' },
  { id: 15, name: 'Червено вино', price: 6.00, categoryId: 11, categoryName: 'Алкохолни' },
  { id: 16, name: 'Тирамису', price: 7.00, categoryId: 5, categoryName: 'Десерти' },
  { id: 17, name: 'Панакота', price: 6.50, categoryId: 5, categoryName: 'Десерти' },
];

export const productsApi = {
  getRootCategories: async (): Promise<Category[]> => {
    // TODO: Replace with actual API call
    // GET /api/categories?parentId=null
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories.filter(c => c.parentId === null);
  },

  getSubcategories: async (parentId: number): Promise<Category[]> => {
    // TODO: Replace with actual API call
    // GET /api/categories?parentId={id}
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories.filter(c => c.parentId === parentId);
  },

  getProductsByCategory: async (categoryId: number): Promise<PosProduct[]> => {
    // TODO: Replace with actual API call
    // GET /api/products?categoryId={id}
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProducts.filter(p => p.categoryId === categoryId);
  },

  searchProducts: async (query: string): Promise<PosProduct[]> => {
    // TODO: Replace with actual API call
    // GET /api/products?search=q
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return mockProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.categoryName?.toLowerCase().includes(lowerQuery)
    );
  },
};
