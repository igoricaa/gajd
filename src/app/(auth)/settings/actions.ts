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

export async function updatePasswordAction(
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return {
      message: 'Forbidden',
    };
  }
  if (!passwordUpdateBucket.check(session.id, 1)) {
    return {
      message: 'Too many requests',
    };
  }

  const password = formData.get('password');
  const newPassword = formData.get('new_password');
  if (typeof password !== 'string' || typeof newPassword !== 'string') {
    return {
      message: 'Invalid or missing fields',
    };
  }
  const strongPassword = await verifyPasswordStrength(newPassword);
  if (!strongPassword) {
    return {
      message: 'Weak password',
    };
  }
  if (!passwordUpdateBucket.consume(session.id, 1)) {
    return {
      message: 'Too many requests',
    };
  }
  const passwordHash = await getUserPasswordHash(user.id);
  const validPassword = await verifyPasswordHash(passwordHash, password);
  if (!validPassword) {
    return {
      message: 'Incorrect password',
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
    message: 'Updated password',
  };
}

export async function updateEmailAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
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
  if (user.registered2FA && !session.twoFactorVerified) {
    return {
      message: 'Forbidden',
    };
  }
  if (!sendVerificationEmailBucket.check(user.id, 1)) {
    return {
      message: 'Too many requests',
    };
  }

  const email = formData.get('email');
  if (typeof email !== 'string') {
    return { message: 'Invalid or missing fields' };
  }
  if (email === '') {
    return {
      message: 'Please enter your email',
    };
  }
  if (!(await verifyEmailInput(email))) {
    return {
      message: 'Please enter a valid email',
    };
  }
  const emailAvailable = checkEmailAvailability(email);
  if (!emailAvailable) {
    return {
      message: 'This email is already used',
    };
  }
  if (!sendVerificationEmailBucket.consume(user.id, 1)) {
    return {
      message: 'Too many requests',
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
      error: 'Too many requests',
      recoveryCode: null,
    };
  }

  const { session, user } = await getCurrentSession();
  if (session === null || user === null) {
    return {
      error: 'Not authenticated',
      recoveryCode: null,
    };
  }
  if (!user.emailVerified) {
    return {
      error: 'Forbidden',
      recoveryCode: null,
    };
  }
  if (!session.twoFactorVerified) {
    return {
      error: 'Forbidden',
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
