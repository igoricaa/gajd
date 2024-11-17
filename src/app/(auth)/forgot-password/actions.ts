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
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const passwordResetEmailIPBucket = new RefillingTokenBucket<string>(3, 60);
const passwordResetEmailUserBucket = new RefillingTokenBucket<number>(3, 60);

const getClientIP = async (): Promise<string | null> => {
  const headersList = await headers();
  return (
    headersList.get('X-Forwarded-For') ||
    headersList.get('X-Real-IP') ||
    headersList.get('Remote-Addr') ||
    null
  );
};

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const clientIP = await getClientIP();
  if (clientIP && !passwordResetEmailIPBucket.check(clientIP, 1)) {
    return { message: AUTH_ERROR_MESSAGES.RATE_LIMIT };
  }

  const email = formData.get('email');
  if (typeof email !== 'string') {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_FIELDS,
    };
  }
  if (!(await verifyEmailInput(email))) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_EMAIL,
    };
  }

  const user = await getUserFromEmail(email);
  if (user === null) {
    return {
      message: AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
    };
  }

  if (
    (clientIP !== null && !passwordResetEmailIPBucket.consume(clientIP, 1)) ||
    !passwordResetEmailUserBucket.consume(user.id, 1)
  ) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
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
