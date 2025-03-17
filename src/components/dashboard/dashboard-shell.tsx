import { UserNav } from '@/components/dashboard/user-nav';
import { MainNav } from '@/components/dashboard/main-nav';
import LinkButton from '../ui/link';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className='flex min-h-screen flex-col space-y-6'>
      <header className='sticky top-0 z-40 border-b bg-background'>
        <div className='container flex mx-auto h-16 items-center justify-between py-4'>
          <MainNav />
          <div className='flex items-center gap-4'>
            <LinkButton href='/dashboard/new-resource'>New Resource</LinkButton>
            <UserNav />
          </div>
        </div>
      </header>
      <div className='max-w-7xl mx-auto w-full'>
        <div className='flex w-full flex-1 flex-col overflow-hidden'>
          {children}
        </div>
      </div>
    </div>
  );
}
