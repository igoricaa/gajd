'use server';

import { verifyEmailInput, checkEmailAvailability } from '@/lib/data/email';
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
} from '@/lib/data/email-verification';
import {
  verifyPasswordStrength,
  verifyPasswordHash,
} from '@/lib/auth/password';
import { getUserPasswordHash, updateUserPassword } from '@/lib/data/user';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import {
  passwordUpdateBucket,
  sendVerificationEmailBucket,
} from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { createSession, verifySession } from '@/lib/auth/session';

export async function updatePasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { sessionId, userId } = await verifySession();

  if (!userId) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }
  if (!passwordUpdateBucket.check(sessionId as string, 1)) {
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
  if (!passwordUpdateBucket.consume(sessionId as string, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const passwordHash = await getUserPasswordHash(userId as number);
  const validPassword = await verifyPasswordHash(passwordHash, password);
  if (!validPassword) {
    return {
      message: AUTH_ERROR_MESSAGES.INCORRECT_PASSWORD,
    };
  }

  passwordUpdateBucket.reset(sessionId as string);
  // invalidateUserSessions(user.id);
  await updateUserPassword(userId as number, newPassword);

  await createSession(userId as number);

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

  const { userId } = await verifySession();

  if (!userId) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }
  if (!sendVerificationEmailBucket.check(userId as number, 1)) {
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
  if (!(verifyEmailInput(email))) {
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
  if (!sendVerificationEmailBucket.consume(userId as number, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const verificationRequest = await createEmailVerificationRequest(
    userId as number,
    email
  );
  await sendVerificationEmail(
    verificationRequest.email,
    verificationRequest.code
  );
  await setEmailVerificationRequestCookie(verificationRequest);

  return redirect('/verify-email');
}
