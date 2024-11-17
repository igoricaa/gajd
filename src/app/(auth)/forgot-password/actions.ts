'use server';

import { verifyEmailInput } from '@/lib/auth/email';
import {
  createPasswordResetSession,
  invalidateUserPasswordResetSessions,
  sendPasswordResetEmail,
  setPasswordResetSessionTokenCookie,
} from '@/lib/auth/password-reset';
import { generateSessionToken } from '@/lib/auth/session';
import { getUserFromEmail } from '@/lib/auth/user';
import { RefillingTokenBucket } from '@/lib/rate-limit/rate-limit';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const passwordResetEmailIPBucket = new RefillingTokenBucket<string>(3, 60);
const passwordResetEmailUserBucket = new RefillingTokenBucket<number>(3, 60);

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: 'Too many requests',
    };
  }
  const headersList = await headers();
  const clientIP =
    headersList.get('X-Forwarded-For') ||
    headersList.get('X-Real-IP') ||
    headersList.get('Remote-Addr') ||
    null;

  if (clientIP !== null && !passwordResetEmailIPBucket.check(clientIP, 1)) {
    return {
      message: 'Too many requests',
    };
  }

  const email = formData.get('email');
  if (typeof email !== 'string') {
    return {
      message: 'Invalid or missing fields',
    };
  }
  if (!(await verifyEmailInput(email))) {
    return {
      message: 'Invalid email',
    };
  }
  const user = await getUserFromEmail(email);
  if (user === null) {
    return {
      message: 'Account does not exist',
    };
  }
  if (clientIP !== null && !passwordResetEmailIPBucket.consume(clientIP, 1)) {
    return {
      message: 'Too many requests',
    };
  }
  if (!passwordResetEmailUserBucket.consume(user.id, 1)) {
    return {
      message: 'Too many requests',
    };
  }

  await invalidateUserPasswordResetSessions(user.id);
  const sessionToken = await generateSessionToken();
  const session = await createPasswordResetSession(
    sessionToken,
    user.id,
    user.email
  );

  await sendPasswordResetEmail(session.email, session.code);
  await setPasswordResetSessionTokenCookie(sessionToken, session.expiresAt);

  return redirect('/reset-password/verify-email');
}
