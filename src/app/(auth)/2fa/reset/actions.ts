'use server';

import { resetUser2FAWithRecoveryCode } from '@/lib/auth/2fa';
import { getCurrentSession } from '@/lib/auth/session';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { recoveryCodeBucket } from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export async function reset2FAAction(
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
  if (!recoveryCodeBucket.check(user.id, 1)) {
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

  if (!recoveryCodeBucket.consume(user.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const valid = await resetUser2FAWithRecoveryCode(user.id, code);
  if (!valid) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_CODE,
    };
  }

  recoveryCodeBucket.reset(user.id);
  return redirect('/2fa/setup');
}
