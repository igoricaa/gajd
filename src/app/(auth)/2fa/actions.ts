'use server';

import { getCurrentSession, setSessionAs2FAVerified } from '@/lib/auth/session';
import { getUserTOTPKey } from '@/lib/auth/user';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { totpBucket } from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { verifyTOTP } from '@oslojs/otp';
import { redirect } from 'next/navigation';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export async function verify2FAAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { session, user } = await getCurrentSession();
  if (session === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }
  if (!user.emailVerified || !user.registered2FA || session.twoFactorVerified) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }

  if (!totpBucket.check(user.id, 1)) {
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
  if (!totpBucket.consume(user.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const totpKey = await getUserTOTPKey(user.id);
  if (totpKey === null) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }
  if (!verifyTOTP(totpKey, 30, 6, code)) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_CODE,
    };
  }
  totpBucket.reset(user.id);
  await setSessionAs2FAVerified(session.id);
  return redirect('/');
}
