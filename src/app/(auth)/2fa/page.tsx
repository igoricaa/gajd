import { getCurrentSession } from '@/lib/auth/session';
import { Link } from 'lucide-react';
import { redirect } from 'next/navigation';
import { TwoFactorVerificationForm } from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return 'Too many requests';
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
      <h1>Two-factor authentication</h1>
      <p>Enter the code from your authenticator app.</p>
      <TwoFactorVerificationForm />
      <Link href='/2fa/reset'>Use recovery code</Link>
    </>
  );
}
