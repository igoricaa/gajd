'use server';

import {
  getUserEmailVerificationRequestFromRequest,
  createEmailVerificationRequest,
  sendVerificationEmail,
  deleteUserEmailVerificationRequest,
  deleteEmailVerificationRequestCookie,
  setEmailVerificationRequestCookie,
} from '@/lib/auth/email-verification';
import { invalidateUserPasswordResetSessions } from '@/lib/auth/password-reset';
import { getCurrentSession } from '@/lib/auth/session';
import { updateUserEmailAndSetEmailAsVerified } from '@/lib/auth/user';
import { ExpiringTokenBucket } from '@/lib/rate-limit/rate-limit';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { sendVerificationEmailBucket } from '@/lib/rate-limit/config';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';

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

  const { session, user } = await getCurrentSession();

  if (session === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }
  if (!bucket.check(user.id, 1)) {
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

  if (!bucket.consume(user.id, 1)) {
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
    deleteUserEmailVerificationRequest(user.id),
    invalidateUserPasswordResetSessions(user.id),
    updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email),
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

  const { session, user } = await getCurrentSession();

  if (session === null) {
    return {
      message: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
    };
  }

  if (!sendVerificationEmailBucket.check(user.id, 1)) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  let verificationRequest = await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null) {
    if (user.emailVerified) {
      return {
        message: AUTH_ERROR_MESSAGES.FORBIDDEN,
      };
    }
    if (!sendVerificationEmailBucket.consume(user.id, 1)) {
      return {
        message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
      };
    }

    verificationRequest = await createEmailVerificationRequest(
      user.id,
      user.email
    );
  } else {
    if (!sendVerificationEmailBucket.consume(user.id, 1)) {
      return {
        message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
      };
    }

    verificationRequest = await createEmailVerificationRequest(
      user.id,
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
