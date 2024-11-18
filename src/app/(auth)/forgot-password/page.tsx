import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { ForgotPasswordForm } from './components';
import Link from 'next/link';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  return (
    <>
      <h1>Forgot your password?</h1>
      <ForgotPasswordForm />
      <Link href='/sign-in'>Sign in</Link>
    </>
  );
}
