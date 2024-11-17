'use server';

import { resetUser2FAWithRecoveryCode } from '@/lib/auth/2fa';
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
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

async function validatePasswordReset2FARequest() {
  const { session, user } = await validatePasswordResetSessionRequest();

  if (session === null) {
    return { error: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED };
  }

  if (
    !session.emailVerified ||
    !user.registered2FA ||
    session.twoFactorVerified
  ) {
    return { error: AUTH_ERROR_MESSAGES.FORBIDDEN };
  }

  return { session, user };
}

function validateCode(formData: FormData) {
  const code = formData.get('code');

  if (typeof code !== 'string') {
    return { error: AUTH_ERROR_MESSAGES.INVALID_FIELDS };
  }

  if (code === '') {
    return { error: AUTH_ERROR_MESSAGES.EMPTY_CODE_FIELD };
  }

  return { code };
}

export async function verifyPasswordReset2FAWithTOTPAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const validation = await validatePasswordReset2FARequest();
  if ('error' in validation) {
    return { message: validation.error };
  }

  const { session } = validation;
  const { code, error: codeValidationError } = validateCode(formData);
  if (codeValidationError) {
    return { message: codeValidationError };
  }

  const totpKey = await getUserTOTPKey(session.userId);
  if (totpKey === null) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }
  if (!totpBucket.consume(session.userId, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }
  if (!verifyTOTP(totpKey, 30, 6, code)) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_CODE,
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
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const validation = await validatePasswordReset2FARequest();
  if ('error' in validation) {
    return { message: validation.error };
  }

  const { session } = validation;

  if (!recoveryCodeBucket.check(session.userId, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { code, error: codeValidationError } = validateCode(formData);
  if (codeValidationError) {
    return { message: codeValidationError };
  }

  if (!recoveryCodeBucket.consume(session.userId, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const valid = await resetUser2FAWithRecoveryCode(session.userId, code);
  if (!valid) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_CODE,
    };
  }

  recoveryCodeBucket.reset(session.userId);
  return redirect('/reset-password');
}
