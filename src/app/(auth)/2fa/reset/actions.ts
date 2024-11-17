'use server';

import { resetUser2FAWithRecoveryCode } from '@/lib/auth/2fa';
import { getCurrentSession } from '@/lib/auth/session';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { recoveryCodeBucket } from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function reset2FAAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: 'Too many requests',
    };
  }

  const { session, user } = await getCurrentSession();
  if (session === null) {
    return {
      message: 'Not authenticated',
    };
  }
  if (!user.emailVerified || !user.registered2FA || session.twoFactorVerified) {
    return {
      message: 'Forbidden',
    };
  }
  if (!recoveryCodeBucket.check(user.id, 1)) {
    return {
      message: 'Too many requests',
    };
  }

  const code = formData.get('code');
  if (typeof code !== 'string') {
    return {
      message: 'Invalid or missing fields',
    };
  }
  if (code === '') {
    return {
      message: 'Please enter your code',
    };
  }
  if (!recoveryCodeBucket.consume(user.id, 1)) {
    return {
      message: 'Too many requests',
    };
  }
  const valid = await resetUser2FAWithRecoveryCode(user.id, code);
  if (!valid) {
    return {
      message: 'Invalid recovery code',
    };
  }

  recoveryCodeBucket.reset(user.id);
  return redirect('/2fa/setup');
}
