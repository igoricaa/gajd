import { validatePasswordResetSessionRequest } from '@/lib/auth/password-reset';
import { redirect } from 'next/navigation';
import { PasswordResetEmailVerificationForm } from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { session } = await validatePasswordResetSessionRequest();

  if (session === null) {
    return redirect('/forgot-password');
  }
  if (session.emailVerified) {
    return redirect('/reset-password');
  }
  return (
    <>
      <h1>Verify your email address</h1>
      <p>We sent an 8-digit code to {session.email}.</p>
      <PasswordResetEmailVerificationForm />
    </>
  );
}
