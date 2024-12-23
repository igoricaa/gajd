import { db } from '../db';
import { and, eq } from 'drizzle-orm';
import {
  NewResource,
  resourceCategories,
  NewResourceCategory,
  resources,
  resourceSubcategories,
  NewResourceSubcategory,
} from '../db/schema';

export async function createResource(resource: NewResource) {
  // TODO: validate, zod
  if (
    !resource ||
    !resource.name ||
    !resource.link ||
    !resource.categoryId ||
    !resource.userId
  ) {
    return { success: false, message: 'Invalid resource data' };
  }

  const resourceResult = await db
    .insert(resources)
    .values({ ...resource })
    .returning();

  if (resourceResult.length < 1) {
    return { success: false, message: 'Failed to create resource' };
  }

  return { success: true, message: 'Resource created successfully' };
}

export async function createCategory(category: NewResourceCategory) {
  // TODO: validate
  if (!category || !category.name) {
    return null;
  }

  const categoryResult = await db
    .insert(resourceCategories)
    .values({
      name: category.name,
      description: category.description,
    })
    .returning();

  if (categoryResult.length < 1) {
    return null;
  }

  return categoryResult[0];
}

export async function createSubcategory(subcategory: NewResourceSubcategory) {
  // TODO: validate

  console.log('subcategory:', subcategory);

  if (!subcategory || !subcategory.name || !subcategory.categoryId) {
    return null;
  }

  const subcategoryResult = await db
    .insert(resourceSubcategories)
    .values({
      name: subcategory.name,
      description: subcategory.description,
      categoryId: subcategory.categoryId,
    })
    .returning();

  if (subcategoryResult.length < 1) {
    return null;
  }

  return subcategoryResult[0];
}

export const getCategories = async () => {
  const categories = await db.select().from(resourceCategories);

  if (categories.length < 1) {
    return [];
  }

  return categories;
};

export const getSubcategories = async () => {
  const subcategories = await db.select().from(resourceSubcategories);

  if (subcategories.length < 1) {
    return [];
  }

  return subcategories;
};

export const getSubcategoriesForCategory = async (categoryId: number) => {
  if (!categoryId) {
    throw new Error('Invalid category ID');
  }

  const subcategories = await db
    .select()
    .from(resourceSubcategories)
    .where(eq(resourceSubcategories.categoryId, categoryId));

  if (subcategories.length < 1) {
    return [];
  }

  return subcategories;
};

export const getResources = async () => {
  const resourcesData = await db.select().from(resources);

  if (resourcesData.length < 1) {
    return [];
  }

  return resourcesData;
};

export const getResourcesByCategory = async (categoryId: number) => {
  if (!categoryId) {
    throw new Error('Invalid category ID');
  }

  const resourcesData = await db
    .select()
    .from(resources)
    .where(eq(resources.categoryId, categoryId));

  if (resourcesData.length < 1) {
    return [];
  }

  return resourcesData;
};

export const getResourcesByCategoryAndSubcategory = async (
  categoryId: number,
  subcategoryId: number
) => {
  if (!categoryId || !subcategoryId) {
    throw new Error('Invalid category or subcategory ID');
  }

  const resourcesData = await db
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.categoryId, categoryId),
        eq(resources.subcategoryId, subcategoryId)
      )
    );

  if (resourcesData.length < 1) {
    return [];
  }

  return resourcesData;
};
