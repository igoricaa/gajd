'use server';

import { verifyEmailInput, checkEmailAvailability } from '@/lib/auth/email';
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
} from '@/lib/auth/email-verification';
import {
  verifyPasswordStrength,
  verifyPasswordHash,
} from '@/lib/auth/password';
import {
  getCurrentSession,
  invalidateUserSessions,
  SessionFlags,
  setSession,
} from '@/lib/auth/session';
import {
  getUserPasswordHash,
  resetUserRecoveryCode,
  updateUserPassword,
} from '@/lib/auth/user';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import {
  passwordUpdateBucket,
  sendVerificationEmailBucket,
} from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

export async function updatePasswordAction(
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }
  if (!passwordUpdateBucket.check(session.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const password = formData.get('password');
  const newPassword = formData.get('new_password');
  if (typeof password !== 'string' || typeof newPassword !== 'string') {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_FIELDS,
    };
  }
  const strongPassword = await verifyPasswordStrength(newPassword);
  if (!strongPassword) {
    return {
      message: AUTH_ERROR_MESSAGES.WEAK_PASSWORD,
    };
  }
  if (!passwordUpdateBucket.consume(session.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const passwordHash = await getUserPasswordHash(user.id);
  const validPassword = await verifyPasswordHash(passwordHash, password);
  if (!validPassword) {
    return {
      message: AUTH_ERROR_MESSAGES.INCORRECT_PASSWORD,
    };
  }

  passwordUpdateBucket.reset(session.id);
  invalidateUserSessions(user.id);
  await updateUserPassword(user.id, newPassword);

  const sessionFlags: SessionFlags = {
    twoFactorVerified: session.twoFactorVerified,
  };
  await setSession(user.id, sessionFlags);

  return {
    message: AUTH_ERROR_MESSAGES.PASSWORD_UPDATED,
  };
}

export async function updateEmailAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return {
      message: AUTH_ERROR_MESSAGES.FORBIDDEN,
    };
  }
  if (!sendVerificationEmailBucket.check(user.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const email = formData.get('email');
  if (typeof email !== 'string') {
    return { message: AUTH_ERROR_MESSAGES.INVALID_FIELDS };
  }
  if (email === '') {
    return {
      message: AUTH_ERROR_MESSAGES.EMPTY_EMAIL_FIELD,
    };
  }
  if (!(await verifyEmailInput(email))) {
    return {
      message: AUTH_ERROR_MESSAGES.INVALID_EMAIL,
    };
  }
  const emailAvailable = checkEmailAvailability(email);
  if (!emailAvailable) {
    return {
      message: AUTH_ERROR_MESSAGES.EMAIL_IN_USE,
    };
  }
  if (!sendVerificationEmailBucket.consume(user.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const verificationRequest = await createEmailVerificationRequest(
    user.id,
    email
  );
  await sendVerificationEmail(
    verificationRequest.email,
    verificationRequest.code
  );
  await setEmailVerificationRequestCookie(verificationRequest);

  return redirect('/verify-email');
}

export async function regenerateRecoveryCodeAction(): Promise<RegenerateRecoveryCodeActionResult> {
  if (!globalPOSTRateLimit()) {
    return {
      error: AUTH_ERROR_MESSAGES.RATE_LIMIT,
      recoveryCode: null,
    };
  }

  const { session, user } = await getCurrentSession();
  if (session === null || user === null) {
    return {
      error: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
      recoveryCode: null,
    };
  }
  if (!user.emailVerified || !session.twoFactorVerified) {
    return {
      error: AUTH_ERROR_MESSAGES.FORBIDDEN,
      recoveryCode: null,
    };
  }

  const recoveryCode = await resetUserRecoveryCode(session.userId);
  return {
    error: null,
    recoveryCode,
  };
}

type RegenerateRecoveryCodeActionResult =
  | {
      error: string;
      recoveryCode: null;
    }
  | {
      error: null;
      recoveryCode: string;
    };
