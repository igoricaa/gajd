import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { ForgotPasswordForm } from './components';
import Link from 'next/link';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return 'Too many requests';
  }

  return (
    <>
      <h1>Forgot your password?</h1>
      <ForgotPasswordForm />
      <Link href='/login'>Sign in</Link>
    </>
  );
}
