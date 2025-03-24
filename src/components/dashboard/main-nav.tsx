'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    // {
    //   href: '/dashboard',
    //   label: 'Dashboard',
    //   active: pathname === '/dashboard',
    // },
    {
      href: '/dashboard/favorites',
      label: 'Favorites',
      active: pathname === '/dashboard/favorites',
    },
    // {
    //   href: '/dashboard/account',
    //   label: 'Account',
    //   active: pathname === '/dashboard/account',
    // },
  ];

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <Link href='/' className='flex items-center'>
        <span className='text-2xl font-semibold text-foreground'>Gajd</span>
      </Link>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
