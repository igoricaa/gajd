'use server';

import { getCurrentSession, setSessionAs2FAVerified } from '@/lib/auth/session';
import { updateUserTOTPKey } from '@/lib/auth/user';
import { RefillingTokenBucket } from '@/lib/rate-limit/rate-limit';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';
import { decodeBase64 } from '@oslojs/encoding';
import { verifyTOTP } from '@oslojs/otp';
import { redirect } from 'next/navigation';

const totpUpdateBucket = new RefillingTokenBucket<number>(3, 60 * 10);

export async function setup2FAAction(
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
  if (
    !user.emailVerified ||
    (user.registered2FA && !session.twoFactorVerified)
  ) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }

  if (!totpUpdateBucket.check(user.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const encodedKey = formData.get('key');
  const code = formData.get('code');
  if (typeof encodedKey !== 'string' || typeof code !== 'string') {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_FIELDS,
    };
  }
  if (code === '' || encodedKey.length !== 28) {
    return {
      message: AUTH_ERROR_MESSAGES.EMPTY_CODE_FIELD,
    };
  }

  let key: Uint8Array;
  try {
    key = decodeBase64(encodedKey);
  } catch {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_KEY,
    };
  }
  if (key.byteLength !== 20) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_KEY,
    };
  }
  if (!totpUpdateBucket.consume(user.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  if (!verifyTOTP(key, 30, 6, code)) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_CODE,
    };
  }
  await updateUserTOTPKey(session.userId, key);
  await setSessionAs2FAVerified(session.id);

  return redirect('/recovery-code');
}
