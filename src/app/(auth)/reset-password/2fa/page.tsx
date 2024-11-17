import { validatePasswordResetSessionRequest } from '@/lib/auth/password-reset';
import { redirect } from 'next/navigation';
import {
  PasswordResetTOTPForm,
  PasswordResetRecoveryCodeForm,
} from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { session, user } = await validatePasswordResetSessionRequest();

  if (session === null) {
    return redirect('/forgot-password');
  }
  if (!session.emailVerified) {
    return redirect('/reset-password/verify-email');
  }
  if (!user.registered2FA || session.twoFactorVerified) {
    return redirect('/reset-password');
  }

  return (
    <>
      <h1>Two-factor authentication</h1>
      <p>Enter the code from your authenticator app.</p>
      <PasswordResetTOTPForm />
      <section>
        <h2>Use your recovery code instead</h2>
        <PasswordResetRecoveryCodeForm />
      </section>
    </>
  );
}
