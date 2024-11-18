import { getCurrentSession } from '@/lib/auth/session';
import { Link } from 'lucide-react';
import { redirect } from 'next/navigation';
import {
  UpdateEmailForm,
  UpdatePasswordForm,
} from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { session, user } = await getCurrentSession();
  if (session === null) {
    return redirect('/sign-in');
  }

  return (
    <>
      <header>
        <Link href='/'>Home</Link>
        <Link href='/settings'>Settings</Link>
      </header>
      <main>
        <h1>Settings</h1>
        <section>
          <h2>Update email</h2>
          <p>Your email: {user.email}</p>
          <UpdateEmailForm />
        </section>
        <section>
          <h2>Update password</h2>
          <UpdatePasswordForm />
        </section>
      </main>
    </>
  );
}
