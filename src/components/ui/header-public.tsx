import { Button } from './button';
import { getUser } from '@/lib/data/user';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import SignOutButton from '@/app/(auth)/dashboard/signout-button';

export default async function Header() {
  const user = await getUser();
  //   const [isMenuOpen, setIsMenuOpen] = useState(false);
  //   const { user, setUser } = useUser();
  //   const router = useRouter();

  //   async function handleSignOut() {
  //     setUser(null);
  //     await signOut();
  //     router.push('/');
  //   }

  return (
    <header className='max-w-7xl mx-auto sticky top-0 left-0 w-full z-50'>
      <div className='px-side py-4 flex justify-between items-center'>
        <Link href='/' className='flex items-center'>
          <span className='text-2xl font-semibold text-foreground'>Gajd</span>
        </Link>
        <div className='flex items-center space-x-4'>
          <Link
            href='/#pricing'
            className='text-sm font-medium text-foreground hover:text-foreground/60'
          >
            Pricing
          </Link>
          <Link
            href='/about'
            className='text-sm font-medium text-foreground hover:text-foreground/60'
          >
            About
          </Link>
          <Link
            href='/dashboard'
            className='text-sm font-medium text-foreground hover:text-foreground/60'
          >
            Dashboard
          </Link>
          <ThemeSwitcher />
          {user ? (
            <SignOutButton />
          ) : (
            <Button
              asChild
              className='bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full'
            >
              <Link href='/sign-in'>Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
