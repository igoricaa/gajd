import { redirect } from 'next/navigation';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { getUser } from '@/lib/data/user';
import {
  getCategoriesAndSubcategories,
  getResources,
} from '@/lib/data/resources';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Category } from '@/lib/types';
import ResourcesWrapper from '@/components/dashboard/resources-wrapper';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const user = await getUser();
  if (!user) {
    return redirect('/sign-in');
  }
  // if (!user.emailVerified) {
  //   return redirect('/verify-email');
  // }

  const resources = await getResources();
  const categoriesAndSubcategories: Category[] =
    await getCategoriesAndSubcategories();

  return (
    <section>
      <DashboardHeader
        heading='Dashboard'
        text='Welcome to your developer resource hub.'
      />
      <ResourcesWrapper
        categoriesAndSubcategories={categoriesAndSubcategories}
        resources={resources}
        // className='grid gap-4 md:grid-cols-[200px_1fr] mt-16'
        className='mt-16 flex gap-4'
      />
    </section>
  );
}
