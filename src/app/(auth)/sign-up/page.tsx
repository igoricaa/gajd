import { SignUpForm } from './components';
import Link from 'next/link';

import { redirect } from 'next/navigation';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';

export default async function Page() {
  // if (!(await globalGETRateLimit())) {
  //   return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  // }

  // const {user} = getUser();

  // if (session !== null) {
  // if (!user.emailVerified) {
  //   return redirect('/verify-email');
  // }

  // return redirect('/');
  // }
  return (
    <>
      <h1>Create an account</h1>
      <p>
        Your username must be at least 3 characters long and your password must
        be at least 8 characters long.
      </p>
      <SignUpForm />
      <Link href='/sign-in'>Sign in</Link>
    </>
  );
}
