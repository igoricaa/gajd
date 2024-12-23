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
    <header className='w-full'>
      <div className='px-side py-4 flex justify-between items-center'>
        <Link href='/' className='flex items-center'>
          <span className='text-2xl font-semibold text-foreground'>Gajd</span>
        </Link>
        <div className='flex items-center space-x-4'>
          <ThemeSwitcher />
          {user ? (
            <SignOutButton />
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
