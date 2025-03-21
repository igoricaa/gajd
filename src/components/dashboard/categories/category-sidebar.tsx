import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryFilter } from './category-filter';
import { ResourceCategory } from '@/lib/db/schema';
import { Category } from '@/lib/types';

export function CategorySidebar({
  categoriesAndSubcategories,
  selectedCategory,
  setSelectedCategory,
}: {
  categoriesAndSubcategories: Category[];
  selectedCategory: ResourceCategory | null;
  setSelectedCategory: (category: ResourceCategory | null) => void;
}) {
  return (
    <ScrollArea className='min-w-64 w-64 h-fit rounded-md p-4 bg-black/20'>
      <div className='flex flex-col space-y-2'>
        <h2 className='font-semibold'>Categories</h2>
        <CategoryFilter
          categories={categoriesAndSubcategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
    </ScrollArea>
  );
}
