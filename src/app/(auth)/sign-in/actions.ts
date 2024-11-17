'use server';

import { verifyEmailInput } from '@/lib/auth/email';
import { verifyPasswordHash } from '@/lib/auth/password';
import { SessionFlags, setSession } from '@/lib/auth/session';
import { getUserFromEmail, getUserPasswordHash } from '@/lib/auth/user';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ipBucket, throttler } from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

const getClientIP = async (): Promise<string | null> => {
  const headersList = await headers();
  return (
    headersList.get('X-Forwarded-For') ||
    headersList.get('X-Real-IP') ||
    headersList.get('Remote-Addr') ||
    null
  );
};

const validateLoginInput = async (
  email: unknown,
  password: unknown
): Promise<ActionResult | null> => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { message: AUTH_ERROR_MESSAGES.INVALID_FIELDS };
  }
  if (email === '' || password === '') {
    return { message: AUTH_ERROR_MESSAGES.EMPTY_EMAIL_PASSWORD_FIELDS };
  }
  if (!(await verifyEmailInput(email))) {
    return { message: AUTH_ERROR_MESSAGES.INVALID_EMAIL };
  }
  return null;
};

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: 'Too many requests',
    };
  }

  // TODO: za prod izbaci, ili stavi da set setuje preko process.env
  // TODO: takodje izvuci mozda na jedno mesto, ponavlja
  const clientIP = await getClientIP();
  if (clientIP && !ipBucket.check(clientIP, 1)) {
    return { message: AUTH_ERROR_MESSAGES.RATE_LIMIT };
  }

  const email = formData.get('email');
  const password = formData.get('password');

  const validationError = await validateLoginInput(email, password);
  if (validationError) return validationError;

  const user = await getUserFromEmail(email as string);
  if (!user) {
    return { message: AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND };
  }

  if (
    (clientIP && !ipBucket.consume(clientIP, 1)) ||
    !throttler.consume(user.id)
  ) {
    return { message: AUTH_ERROR_MESSAGES.RATE_LIMIT };
  }

  const passwordHash = await getUserPasswordHash(user.id);
  const validPassword = await verifyPasswordHash(
    passwordHash,
    password as string
  );
  if (!validPassword) {
    return { message: AUTH_ERROR_MESSAGES.INVALID_PASSWORD };
  }

  throttler.reset(user.id);

  const sessionFlags: SessionFlags = {
    twoFactorVerified: false,
  };
  await setSession(user.id, sessionFlags);

  if (!user.emailVerified) return redirect('/verify-email');
  if (!user.registered2FA) return redirect('/2fa/setup');
  return redirect('/2fa');
}