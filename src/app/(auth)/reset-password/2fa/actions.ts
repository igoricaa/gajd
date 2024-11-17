'use server';

import {
  resetUser2FAWithRecoveryCode,
} from '@/lib/auth/2fa';
import {
  setPasswordResetSessionAs2FAVerified,
  validatePasswordResetSessionRequest,
} from '@/lib/auth/password-reset';
import { getUserTOTPKey } from '@/lib/auth/user';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { totpBucket, recoveryCodeBucket } from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { verifyTOTP } from '@oslojs/otp';
import { redirect } from 'next/navigation';

export async function verifyPasswordReset2FAWithTOTPAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: 'Too many requests',
    };
  }

  const { session, user } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return {
      message: 'Not authenticated',
    };
  }
  if (
    !session.emailVerified ||
    !user.registered2FA ||
    session.twoFactorVerified
  ) {
    return {
      message: 'Forbidden',
    };
  }
  if (!totpBucket.check(session.userId, 1)) {
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
  const totpKey = await getUserTOTPKey(session.userId);
  if (totpKey === null) {
    return {
      message: 'Forbidden',
    };
  }
  if (!totpBucket.consume(session.userId, 1)) {
    return {
      message: 'Too many requests',
    };
  }
  if (!verifyTOTP(totpKey, 30, 6, code)) {
    return {
      message: 'Invalid code',
    };
  }

  totpBucket.reset(session.userId);
  await setPasswordResetSessionAs2FAVerified(session.id);
  return redirect('/reset-password');
}

export async function verifyPasswordReset2FAWithRecoveryCodeAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
    return {
      message: 'Too many requests',
    };
  }

  const { session, user } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return {
      message: 'Not authenticated',
    };
  }
  if (
    !session.emailVerified ||
    !user.registered2FA ||
    session.twoFactorVerified
  ) {
    return {
      message: 'Forbidden',
    };
  }

  if (!recoveryCodeBucket.check(session.userId, 1)) {
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
  if (!recoveryCodeBucket.consume(session.userId, 1)) {
    return {
      message: 'Too many requests',
    };
  }

  const valid = await resetUser2FAWithRecoveryCode(session.userId, code);
  if (!valid) {
    return {
      message: 'Invalid code',
    };
  }

  recoveryCodeBucket.reset(session.userId);
  return redirect('/reset-password');
}