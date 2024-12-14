import { redirect } from 'next/navigation';
import SignOutButton from './signout-button';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { verifySession } from '@/lib/auth/session';
import { getUser } from '@/lib/data/user';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const user = await getUser();
  if (user === null) {
    return redirect('/sign-in');
  }
  // if (!user.emailVerified) {
  //   return redirect('/verify-email');
  // }

  return (
    <>
      <h1>Dashboard</h1>
      <p>We're in!</p>
      <SignOutButton />
    </>
  );
}
