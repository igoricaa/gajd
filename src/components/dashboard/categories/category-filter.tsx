'use client';

import { Badge } from '@/components/ui/badge';
import { ResourceCategory } from '@/lib/db/schema';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/lib/types';

export function CategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
}: {
  categories: Category[];
  selectedCategory: ResourceCategory | null;
  setSelectedCategory: (category: ResourceCategory | null) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  return (
    <div className='space-y-2'>
      <Badge
        key={'all'}
        variant={selectedCategory === null ? 'default' : 'outline'}
        className='cursor-pointer capitalize mr-2 mb-2'
        onClick={() => setSelectedCategory(null)}
      >
        All
      </Badge>

      {categories.map((category: Category) => (
        <div key={category.name} className='space-y-1'>
          <div className='flex items-center'>
            <button
              onClick={() => toggleCategory(category.name)}
              className='mr-1 p-1 hover:bg-gray-100 rounded-full'
              aria-label={
                expandedCategories[category.name]
                  ? 'Collapse category'
                  : 'Expand category'
              }
            >
              {expandedCategories[category.name] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            <Badge
              variant={selectedCategory === category ? 'default' : 'outline'}
              className='cursor-pointer capitalize'
              onClick={() => setSelectedCategory(category)}
            >
              {category.name}
            </Badge>
          </div>

          {expandedCategories[category.name] && (
            <ul className='ml-6 space-y-1 mt-1'>
              {category.subcategories.map((subcategory: ResourceCategory) => (
                <li
                  key={subcategory.name}
                  onClick={() => setSelectedCategory(subcategory)}
                >
                  <Badge
                    variant={
                      selectedCategory === subcategory ? 'default' : 'secondary'
                    }
                    className='cursor-pointer capitalize'
                  >
                    {subcategory.name}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
