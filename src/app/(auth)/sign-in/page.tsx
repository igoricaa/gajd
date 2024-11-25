import { redirect } from 'next/navigation';
import { LoginForm } from './components';
import Link from 'next/link';
import { verifySession } from '@/lib/auth/session';
import { getUser } from '@/lib/data/user';

export default async function Page() {
  const { userId } = await verifySession();
  // TODO: extract to separate function?
  if (userId !== null) {
    const user = await getUser(userId as number);
    if (user === null) return redirect('/sign-in');

    // if (!user.emailVerified) {
    //   return redirect('/verify-email');
    // }

    return redirect('/');
  }

  return (
    <>
      <h1>Sign in</h1>
      <LoginForm />
      <Link href='/sign-up'>Create an account</Link>
      <Link href='/forgot-password'>Forgot password?</Link>
      <a href='sign-in/github'>Sign in with GitHub</a>
    </>
  );
}
