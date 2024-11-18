'use server';

import {
  getUserEmailVerificationRequestFromRequest,
  createEmailVerificationRequest,
  sendVerificationEmail,
  deleteUserEmailVerificationRequest,
  deleteEmailVerificationRequestCookie,
  setEmailVerificationRequestCookie,
} from '@/lib/data/email-verification';
import { invalidateUserPasswordResetSessions } from '@/lib/auth/password-reset';
import { getUser, updateUserEmailAndSetEmailAsVerified } from '@/lib/data/user';
import { ExpiringTokenBucket } from '@/lib/rate-limit/rate-limit';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { sendVerificationEmailBucket } from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { verifySession } from '@/lib/auth/session';

const bucket = new ExpiringTokenBucket<number>(5, 60 * 30);

export async function verifyEmailAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { userId } = await verifySession();
  if (userId === null) return redirect('/sign-in');

  if (userId === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }
  if (!bucket.check(userId, 1)) {
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

  let verificationRequest = await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }

  if (!bucket.consume(userId, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  if (Date.now() >= verificationRequest.expiresAt.getTime()) {
    verificationRequest = await createEmailVerificationRequest(
      verificationRequest.userId,
      verificationRequest.email
    );
    await sendVerificationEmail(
      verificationRequest.email,
      verificationRequest.code
    );

    return {
      message: AUTH_ERROR_MESSAGES.EXPIRED_CODE,
    };
  }

  if (verificationRequest.code !== code) {
    return {
      message: AUTH_ERROR_MESSAGES.INCORRECT_CODE,
    };
  }

  await Promise.all([
    deleteUserEmailVerificationRequest(userId),
    invalidateUserPasswordResetSessions(userId),
    updateUserEmailAndSetEmailAsVerified(userId, verificationRequest.email),
    deleteEmailVerificationRequestCookie(),
  ]);

  return redirect('/');
}

export async function resendEmailVerificationCodeAction(): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { userId } = await verifySession();

  if (userId === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }

  if (!sendVerificationEmailBucket.check(userId, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  let verificationRequest = await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null) {
    const user = await getUser(userId);
    if (user === null) {
      return {
        message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
      };
    }

    if (user.emailVerified) {
      return {
        message: AUTH_ERROR_MESSAGES.FORBIDDEN,
      };
    }
    if (!sendVerificationEmailBucket.consume(userId, 1)) {
      return {
        message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
      };
    }

    verificationRequest = await createEmailVerificationRequest(
      user.id,
      user.email
    );
  } else {
    if (!sendVerificationEmailBucket.consume(userId, 1)) {
      return {
        message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
      };
    }

    verificationRequest = await createEmailVerificationRequest(
      userId,
      verificationRequest.email
    );
  }

  await sendVerificationEmail(
    verificationRequest.email,
    verificationRequest.code
  );
  await setEmailVerificationRequestCookie(verificationRequest);

  return {
    message: AUTH_ERROR_MESSAGES.NEW_CODE_SENT,
  };
}
