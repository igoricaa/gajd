import { ResourceCategoryForm } from '@/components/dashboard/forms/resource-category-form';
import { ResourceForm } from '@/components/dashboard/forms/resource-form';
import { ResourceSubcategoryForm } from '@/components/dashboard/forms/resource-subcategory-form';
import LinkButton from '@/components/ui/link';
import { getCategories, getSubcategories } from '@/lib/data/resources';

const ResourcesPage = async () => {
  const categories = await getCategories();
  const subcategories = await getSubcategories();

  return (
    <div className='container mx-auto py-8'>
      <div className='flex items-center mb-12 gap-4'>
        <h1 className='text-3xl font-bold mb-0'>Resource Management</h1>
        <LinkButton href='/dashboard'>Dashboard</LinkButton>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        <div>
          <h2 className='text-2xl font-semibold mb-4'>Create Resource</h2>
          <ResourceForm categories={categories} subcategories={subcategories} />
        </div>

        <div>
          <h2 className='text-2xl font-semibold mb-4'>
            Create Resource Category
          </h2>
          <ResourceCategoryForm />
        </div>

        <div>
          <h2 className='text-2xl font-semibold mb-4'>
            Create Resource Subcategory
          </h2>
          <ResourceSubcategoryForm categories={categories} />
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
