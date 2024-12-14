import { CircleIcon, Home, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { getUser } from '@/lib/data/user';
import Link from 'next/link';
import { ThemeSwitcher } from '../theme/theme-switcher';

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
    <header className='border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
        <Link href='/' className='flex items-center'>
          <span className='ml-2 text-xl font-semibold text-gray-900'>Gajd</span>
        </Link>
        <div className='flex items-center space-x-4'>
          <Link
            href='/pricing'
            className='text-sm font-medium text-gray-700 hover:text-gray-900'
          >
            Pricing
          </Link>
          <ThemeSwitcher />
          {user ? (
            <p>ulogovan!</p>
          ) : (
            <Button
              asChild
              className='bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full'
            >
              <Link href='/sign-up'>Sign Up</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
