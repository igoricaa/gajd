'use server';

import { verifySession } from '@/lib/auth/session';
import {
  createCategory,
  createResource,
  createSubcategory,
} from '@/lib/data/resources';
import {
  NewResource,
  NewResourceCategory,
  NewResourceSubcategory,
} from '@/lib/db/schema';

export async function createResourceAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const link = formData.get('link') as string;
  const categoryId = parseInt(formData.get('categoryId') as string);
  const subcategoryId = parseInt(formData.get('subcategoryId') as string);
  const { userId } = await verifySession();

  if (userId === null) {
    return { success: false, message: 'User not found' };
  }

  const resource: NewResource = {
    name,
    description,
    link,
    categoryId,
    subcategoryId,
    userId,
  };

  const result = await createResource(resource);

  if (!result) {
    return { success: false, message: 'Failed to create resource' };
  }

  return { success: true, message: 'Resource created successfully' };
}

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  const category: NewResourceCategory = {
    name,
    description,
  };

  const result = await createCategory(category);

  if (!result) {
    return { success: false, message: 'Failed to create resource category' };
  }

  return { success: true, message: 'Resource category created successfully' };
}

export async function createSubcategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const description = formData.get('description') as string;

  console.log('formData:', formData);
  console.log('createSubcategoryAction', name, categoryId, description);

  const subcategory: NewResourceSubcategory = {
    name,
    description,
    categoryId: parseInt(categoryId),
  };

  console.log('subcategoryAction:', subcategory);

  const result = await createSubcategory(subcategory);

  if (!result) {
    return { success: false, message: 'Failed to create resource subcategory' };
  }

  return {
    success: true,
    message: 'Resource subcategory created successfully',
  };
}
