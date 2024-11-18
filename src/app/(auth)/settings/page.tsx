import { Link } from 'lucide-react';
import { redirect } from 'next/navigation';
import { UpdateEmailForm, UpdatePasswordForm } from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { verifySession } from '@/lib/auth/session';
import { getUser } from '@/lib/data/user';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT;
  }

  const { userId } = await verifySession();
  if (userId === null) return redirect('/sign-in');

  const user = await getUser(userId as number);
  if (user === null) return redirect('/sign-in');

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
