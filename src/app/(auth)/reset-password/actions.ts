'use server';

import { verifyPasswordStrength } from '@/lib/auth/password';
import {
  deletePasswordResetSessionTokenCookie,
  invalidateUserPasswordResetSessions,
  validatePasswordResetSessionRequest,
} from '@/lib/auth/password-reset';
import {
  invalidateUserSessions,
  SessionFlags,
  setSession,
} from '@/lib/auth/session';
import { updateUserPassword } from '@/lib/auth/user';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: 'Too many requests',
    };
  }

  const { session: passwordResetSession, user } =
    await validatePasswordResetSessionRequest();

  if (passwordResetSession === null) {
    return {
      message: 'Not authenticated',
    };
  }
  if (!passwordResetSession.emailVerified) {
    return {
      message: 'Forbidden',
    };
  }
  if (user.registered2FA && !passwordResetSession.twoFactorVerified) {
    return {
      message: 'Forbidden',
    };
  }

  const password = formData.get('password');
  if (typeof password !== 'string') {
    return {
      message: 'Invalid or missing fields',
    };
  }

  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) {
    return {
      message: 'Weak password',
    };
  }

  await invalidateUserPasswordResetSessions(passwordResetSession.userId);
  await invalidateUserSessions(passwordResetSession.userId);
  await updateUserPassword(passwordResetSession.userId, password);

  const sessionFlags: SessionFlags = {
    twoFactorVerified: passwordResetSession.twoFactorVerified,
  };

  await setSession(user.id, sessionFlags);
  await deletePasswordResetSessionTokenCookie();

  return redirect('/');
}
