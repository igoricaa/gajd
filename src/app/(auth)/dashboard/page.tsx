import { redirect } from 'next/navigation';
import SignOutButton from './signout-button';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { getUser } from '@/lib/data/user';
import { CategoryFilter } from '@/components/dashboard/category-filter';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ResourceGrid } from '@/components/dashboard/resource-grid';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  // const user = await getUser();
  // // if (user === null) {
  // //   return redirect('/sign-in');
  // // }
  // if (!user.emailVerified) {
  //   return redirect('/verify-email');
  // }

  return (
    <section className='px-side py-4 min-h-screen'>
      <DashboardShell>
        <DashboardHeader
          heading='Dashboard'
          text='Welcome to your developer resource hub.'
        />
        <div className='grid gap-4 md:grid-cols-[200px_1fr]'>
          <CategoryFilter />
          <ResourceGrid />
        </div>
      </DashboardShell>
    </section>
  );
}
