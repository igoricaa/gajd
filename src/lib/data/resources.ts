import { db } from '../db';
import { and, eq, or } from 'drizzle-orm';
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

  console.log('resource:', resource);

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
  if (!category || !category.name || !category.slug) {
    return null;
  }

  const categoryResult = await db
    .insert(resourceCategories)
    .values({
      name: category.name,
      slug: category.slug,
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

  if (
    !subcategory ||
    !subcategory.name ||
    !subcategory.slug ||
    !subcategory.categoryId
  ) {
    return null;
  }

  const subcategoryResult = await db
    .insert(resourceSubcategories)
    .values({
      name: subcategory.name,
      slug: subcategory.slug,
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

export const getCategoriesAndSubcategories = async () => {
  const categoriesData = await db.select().from(resourceCategories);
  const subcategoriesData = await db.select().from(resourceSubcategories);

  const result = categoriesData.map((category) => {
    const categorySubcategories = subcategoriesData.filter(
      (subcategory) => subcategory.categoryId === category.id
    );

    return {
      ...category,
      subcategories: categorySubcategories,
    };
  });

  return result;
};

// export const getCategoryByName = async (name: string) => {
//   const data = await db
//     .select()
//     .from(resourceCategories)
//     .where(eq(resourceCategories.name, name));

//   const category = data[0];

//   if (!category) {
//     return null;
//   }

//   return category;
// };

// export const getSubcategoryByName = async (name: string) => {
//   const data = await db
//     .select()
//     .from(resourceSubcategories)
//     .where(eq(resourceSubcategories.name, name));

//   const subcategory = data[0];

//   if (!subcategory) {
//     return null;
//   }

//   return subcategory;
// };

// export const getSubCategoryOrCategoryByName = async (categoryName: string) => {
//   const subCategory = await getSubcategoryByName(categoryName);

//   if (!subCategory) {
//     return await getCategoryByName(categoryName);
//   }

//   return subCategory;
// };

export const getSubcategories = async () => {
  const subcategories = await db.select().from(resourceSubcategories);

  if (subcategories.length < 1) {
    return [];
  }

  return subcategories;
};

// export const getSubcategoriesForCategory = async (categoryId: number) => {
//   if (!categoryId) {
//     throw new Error('Invalid category ID');
//   }

//   const subcategories = await db
//     .select()
//     .from(resourceSubcategories)
//     .where(eq(resourceSubcategories.categoryId, categoryId));

//   if (subcategories.length < 1) {
//     return [];
//   }

//   return subcategories;
// };

export const getResources = async () => {
  const resourcesData = await db.select().from(resources);

  if (resourcesData.length < 1) {
    return [];
  }

  return resourcesData;
};

// export const getResourcesByCategory = async (categoryId: number) => {
//   if (!categoryId) {
//     throw new Error('Invalid category ID');
//   }

//   const resourcesData = await db
//     .select()
//     .from(resources)
//     .where(eq(resources.categoryId, categoryId));

//   if (resourcesData.length < 1) {
//     return [];
//   }

//   return resourcesData;
// };

// export const getResourcesBySubcategory = async (subcategoryId: number) => {
//   if (!subcategoryId) {
//     throw new Error('Invalid subcategory ID');
//   }

//   const resourcesData = await db
//     .select()
//     .from(resources)
//     .where(eq(resources.subcategoryId, subcategoryId));

//   if (resourcesData.length < 1) {
//     return [];
//   }

//   return resourcesData;
// };

// export const getResourcesByCategoryName = async (categoryName: string) => {
//   if (!categoryName) {
//     throw new Error('Invalid category name');
//   }

//   const subcategory = await getSubcategoryByName(categoryName);

//   if (subcategory) {
//     return getResourcesBySubcategory(subcategory.id);
//   }

//   const category = await getCategoryByName(categoryName);

//   if (!category) {
//     return [];
//   }

//   return getResourcesByCategory(category.id);
// };
