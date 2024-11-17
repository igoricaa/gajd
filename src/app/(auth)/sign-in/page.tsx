import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { LoginForm } from './components';
import Link from 'next/link';
import { globalGETRateLimit } from '@/lib/rate-limit/request';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return 'Too many requests';
  }

  const { session, user } = await getCurrentSession();

  if (session !== null) {
    if (!user.emailVerified) {
      return redirect('/verify-email');
    }
    if (!user.registered2FA) {
      return redirect('/2fa/setup');
    }
    if (!session.twoFactorVerified) {
      return redirect('/2fa');
    }
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
