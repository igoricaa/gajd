import { getCurrentSession } from '@/lib/auth/session';
import { getUserRecoveryCode } from '@/lib/auth/user';
import { Link } from 'lucide-react';
import { redirect } from 'next/navigation';
import {
  UpdateEmailForm,
  UpdatePasswordForm,
  RecoveryCodeSection,
} from './components';
import { globalGETRateLimit } from '@/lib/rate-limit/request';

export default async function Page() {
  if (!(await globalGETRateLimit())) {
    return 'Too many requests';
  }

  const { session, user } = await getCurrentSession();
  if (session === null) {
    return redirect('/login');
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect('/2fa');
  }

  let recoveryCode: string | null = null;
  if (user.registered2FA) {
    recoveryCode = await getUserRecoveryCode(user.id);
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
        {user.registered2FA && (
          <section>
            <h2>Update two-factor authentication</h2>
            <Link href='/2fa/setup'>Update</Link>
          </section>
        )}
        {recoveryCode !== null && (
          <RecoveryCodeSection recoveryCode={recoveryCode} />
        )}
      </main>
    </>
  );
}
