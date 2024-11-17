import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { TwoFactorResetForm } from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { session, user } = await getCurrentSession();
  if (session === null) {
    return redirect('/login');
  }
  if (!user.emailVerified) {
    return redirect('/verify-email');
  }
  if (!user.registered2FA) {
    return redirect('/2fa/setup');
  }
  if (session.twoFactorVerified) {
    return redirect('/');
  }
  return (
    <>
      <h1>Recover your account</h1>
      <TwoFactorResetForm />
    </>
  );
}
