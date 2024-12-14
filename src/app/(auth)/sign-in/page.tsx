import { redirect } from 'next/navigation';
import { LoginForm } from './components';
import { getUser } from '@/lib/data/user';
import Link from 'next/link';

export default async function Page() {
  const user = await getUser();
  if (user !== null) {
    return redirect('/');
  }

  // if (!user.emailVerified) {
  //   return redirect('/verify-email');
  // }

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
