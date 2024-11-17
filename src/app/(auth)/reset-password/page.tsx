import { validatePasswordResetSessionRequest } from '@/lib/auth/password-reset';
import { redirect } from 'next/navigation';
import { PasswordResetForm } from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return 'Too many requests';
  }

  const { session, user } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return redirect('/forgot-password');
  }
  if (!session.emailVerified) {
    return redirect('/reset-password/verify-email');
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect('/reset-password/2fa');
  }
  return (
    <>
      <h1>Enter your new password</h1>
      <PasswordResetForm />
    </>
  );
}
