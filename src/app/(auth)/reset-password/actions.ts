'use server';

import { verifyPasswordStrength } from '@/lib/auth/password';
import {
  deletePasswordResetSessionTokenCookie,
  invalidateUserPasswordResetSessions,
  validatePasswordResetSessionRequest,
} from '@/lib/auth/password-reset';
import { createSession } from '@/lib/auth/session';
import { deleteSession } from '@/lib/auth/session';
import { updateUserPassword } from '@/lib/data/user';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { redirect } from 'next/navigation';

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { session: passwordResetSession, user } =
    await validatePasswordResetSessionRequest();

  if (passwordResetSession === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }
  if (!passwordResetSession.emailVerified) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const password = formData.get('password');
  if (typeof password !== 'string') {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_FIELDS,
    };
  }

  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) {
    return {
      message: AUTH_ERROR_MESSAGES.WEAK_PASSWORD,
    };
  }

  await Promise.all([
    invalidateUserPasswordResetSessions(passwordResetSession.userId),
    // invalidateUserSessions(passwordResetSession.userId),
    deleteSession(),
    updateUserPassword(passwordResetSession.userId, password),
  ]);

  await Promise.all([
    createSession(user.id),
    deletePasswordResetSessionTokenCookie(),
  ]);

  return redirect('/');
}
