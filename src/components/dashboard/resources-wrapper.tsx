'use client';

import { cn } from '@/lib/utils';
import { CategorySidebar } from './categories/category-sidebar';
import { ResourceGrid } from './resource-grid';
import { Resource, ResourceCategory } from '@/lib/db/schema';
import { useEffect, useState } from 'react';
import { Category } from '@/lib/types';

const ResourcesWrapper = ({
  categoriesAndSubcategories,
  resources,
  className,
}: {
  categoriesAndSubcategories: Category[];
  resources: Resource[];
  className?: string;
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<ResourceCategory | null>(null);
  const [filteredResources, setFilteredResources] =
    useState<Resource[]>(resources);

  useEffect(() => {
    console.log('izabrana: ', selectedCategory);

    if (selectedCategory) {
      const subcategoryCurr = categoriesAndSubcategories.find((category) =>
        category.subcategories.some(
          (subcategory) => subcategory.name === selectedCategory.name
        )
      );

      console.log('subcategoryCurr: ', subcategoryCurr);

      if (subcategoryCurr) {
        setFilteredResources(
          resources.filter(
            (resource) => resource.subcategoryId === selectedCategory.id
          )
        );

        return;
      }

      const categoryCurr = categoriesAndSubcategories.find(
        (category) => category.name === selectedCategory.name
      );

      if (categoryCurr) {
        setFilteredResources(
          resources.filter(
            (resource) => resource.categoryId === categoryCurr.id
          )
        );
      }
    } else {
      setFilteredResources(resources);
    }
  }, [selectedCategory]);

  return (
    <div className={cn(className)}>
      <CategorySidebar
        categoriesAndSubcategories={categoriesAndSubcategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <ResourceGrid resources={filteredResources} />
    </div>
  );
};

export default ResourcesWrapper;
