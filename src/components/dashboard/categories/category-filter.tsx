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

  const toggleCategory = (category: Category) => {
    setSelectedCategory(category);

    if (category !== selectedCategory && expandedCategories[category.name]) {
      setExpandedCategories((prev) => ({
        ...prev,
        [category.name]: false,
      }));
    }

    setExpandedCategories((prev) => ({
      ...prev,
      [category.name]: !prev[category.name],
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
          <Badge
            variant={selectedCategory === category ? 'default' : 'outline'}
            className='cursor-pointer capitalize'
            onClick={() => toggleCategory(category)}
          >
            {category.name}
            {expandedCategories[category.name] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Badge>

          {expandedCategories[category.name] && (
            <ul className='ml-2 space-y-1 mt-1'>
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
