'use server';

import {
  setPasswordResetSessionAsEmailVerified,
  validatePasswordResetSessionRequest,
} from '@/lib/auth/password-reset';
import { setUserAsEmailVerifiedIfEmailMatches } from '@/lib/auth/user';
import { ExpiringTokenBucket } from '@/lib/rate-limit/rate-limit';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';
import { redirect } from 'next/navigation';

const emailVerificationBucket = new ExpiringTokenBucket<number>(5, 60 * 30);

export async function verifyPasswordResetEmailAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { session } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }
  if (session.emailVerified) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }
  if (!emailVerificationBucket.check(session.userId, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const code = formData.get('code');
  if (typeof code !== 'string') {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_FIELDS,
    };
  }
  if (code === '') {
    return {
      message: AUTH_ERROR_MESSAGES.EMPTY_CODE_FIELD,
    };
  }
  if (!emailVerificationBucket.consume(session.userId, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }
  if (code !== session.code) {
    return {
      message: AUTH_ERROR_MESSAGES.INCORRECT_CODE,
    };
  }

  emailVerificationBucket.reset(session.userId);
  await setPasswordResetSessionAsEmailVerified(session.id);
  const emailMatches = await setUserAsEmailVerifiedIfEmailMatches(
    session.userId,
    session.email
  );

  if (!emailMatches) {
    return {
      message: AUTH_ERROR_MESSAGES.RESTART_PROCESS,
    };
  }

  // TODO:
  // return redirect('/reset-password/2fa');
  return redirect('/');
}
