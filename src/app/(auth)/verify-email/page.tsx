import { getUserEmailVerificationRequestFromRequest } from '@/lib/auth/email-verification';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  EmailVerificationForm,
  ResendEmailVerificationCodeForm,
} from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import Link from 'next/link';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect('/sign-in');
  }

  // TODO: Ideally we'd sent a new verification email automatically if the previous one is expired,
  // but we can't set cookies inside server components.
  const verificationRequest =
    await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null && user.emailVerified) {
    return redirect('/');
  }

  return (
    <>
      <h1>Verify your email address</h1>
      <p>
        We sent an 8-digit code to {verificationRequest?.email ?? user.email}.
      </p>
      <EmailVerificationForm />
      <ResendEmailVerificationCodeForm />
      <Link href='/settings'>Change your email</Link>
    </>
  );
}
