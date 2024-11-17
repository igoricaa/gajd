import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import SignOutButton from './signout-button';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { session, user } = await getCurrentSession();

  if (session === null || user === null) {
    return redirect('/sign-in');
  }
  if (!user.emailVerified) {
    return redirect('/verify-email');
  }
  if (!user.registered2FA) {
    return redirect('/2fa/setup');
  }
  if (!session.twoFactorVerified) {
    return redirect('/2fa');
  }

  return (
    <>
      <h1>Dashboard</h1>
      <p>We're in!</p>
      <SignOutButton />
    </>
  );
}
