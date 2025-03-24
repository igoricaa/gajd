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
import { LexicalContent } from '@/lib/types';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { appErrors } from '@/lib/errors';
import { AppError } from '@/lib/errors';
import type { ActionResponse } from '@/types/actions';

export async function createResourceAction(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = getSlug(name);
  const description = formData.get('description') as string;
  const featuredImage = formData.get('featuredImage') as string;
  const link = formData.get('link') as string;
  const useCase = formData.get('useCase') as string;
  const overview = formData.get('overview') as string;
  const howToUse = formData.get('howToUse') as string;
  const categoryId = parseInt(formData.get('categoryId') as string);
  const subCategoryIdStr = formData.get('subcategoryId') as string;
  const subcategoryId = subCategoryIdStr ? parseInt(subCategoryIdStr) : null;
  const { userId } = await verifySession();

  if (userId === null) {
    return { success: false, message: 'User not found' };
  }

  const resource: NewResource = {
    name,
    slug,
    description,
    featuredImage,
    link,
    useCase: useCase ? (JSON.parse(useCase) as LexicalContent) : null,
    overview: overview ? (JSON.parse(overview) as LexicalContent) : null,
    howToUse: howToUse ? (JSON.parse(howToUse) as LexicalContent) : null,
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

export async function editResourceAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { userId } = await verifySession();
    if (!userId) {
      throw new AppError('User not found');
    }

    const id = formData.get('id') as string;
    if (!id) {
      throw new AppError('Resource ID is required');
    }

    const name = formData.get('name') as string;
    if (!name) {
      throw new AppError('Name is required');
    }

    const slug = getSlug(name);
    const description = formData.get('description') as string;
    const featuredImage = formData.get('featuredImage') as string;
    const link = formData.get('link') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);
    const subcategoryId = formData.get('subcategoryId')
      ? parseInt(formData.get('subcategoryId') as string)
      : null;

    // Parse JSONB fields
    const useCase = formData.get('useCase')
      ? JSON.parse(formData.get('useCase') as string)
      : null;
    const overview = formData.get('overview')
      ? JSON.parse(formData.get('overview') as string)
      : null;
    const howToUse = formData.get('howToUse')
      ? JSON.parse(formData.get('howToUse') as string)
      : null;

    await db
      .update(resources)
      .set({
        name,
        slug,
        description,
        featuredImage,
        link,
        categoryId,
        subcategoryId,
        useCase,
        overview,
        howToUse,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, parseInt(id)));

    revalidatePath('/dashboard/resources');
    revalidatePath(`/dashboard/resources/${slug}`);

    return {
      success: true,
      message: 'Resource updated successfully',
    };
  } catch (error) {
    console.error('Error updating resource:', error);
    return {
      success: false,
      error: error instanceof AppError ? error : appErrors.UNEXPECTED_ERROR,
    };
  }
}

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = name.toLowerCase().replace(/ /g, '-');
  const description = formData.get('description') as string;

  const category: NewResourceCategory = {
    name,
    slug,
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
  const slug = name.toLowerCase().replace(/ /g, '-');
  const categoryId = formData.get('categoryId') as string;
  const description = formData.get('description') as string;

  console.log('formData:', formData);
  console.log('createSubcategoryAction', name, categoryId, description);

  const subcategory: NewResourceSubcategory = {
    name,
    slug,
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

const getSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');
};
