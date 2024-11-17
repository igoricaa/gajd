import { getCurrentSession } from '@/lib/auth/session';
import { getUserRecoveryCode } from '@/lib/auth/user';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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
  if (!session.twoFactorVerified) {
    return redirect('/2fa');
  }
  const recoveryCode = await getUserRecoveryCode(user.id);

  return (
    <>
      <h1>Recovery code</h1>
      <p>Your recovery code is: {recoveryCode}</p>
      <p>
        You can use this recovery code if you lose access to your second
        factors.
      </p>
      <Link href='/'>Next</Link>
    </>
  );
}
