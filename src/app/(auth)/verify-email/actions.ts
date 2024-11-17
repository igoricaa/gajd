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

const bucket = new ExpiringTokenBucket<number>(5, 60 * 30);

export async function verifyEmailAction(
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
  if (!bucket.check(user.id, 1)) {
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
      message: 'Enter your code',
    };
  }

  let verificationRequest = await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null) {
    return {
      message: 'Not authenticated',
    };
  }

  if (!bucket.consume(user.id, 1)) {
    return {
      message: 'Too many requests',
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
      message:
        'The verification code was expired. We sent another code to your inbox.',
    };
  }

  if (verificationRequest.code !== code) {
    return {
      message: 'Incorrect code.',
    };
  }

  await deleteUserEmailVerificationRequest(user.id);
  await invalidateUserPasswordResetSessions(user.id);
  await updateUserEmailAndSetEmailAsVerified(
    user.id,
    verificationRequest.email
  );
  await deleteEmailVerificationRequestCookie();

  if (!user.registered2FA) {
    return redirect('/2fa/setup');
  }
  return redirect('/');
}

export async function resendEmailVerificationCodeAction(): Promise<ActionResult> {
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
  if (!sendVerificationEmailBucket.check(user.id, 1)) {
    return {
      message: 'Too many requests',
    };
  }

  let verificationRequest = await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null) {
    if (user.emailVerified) {
      return {
        message: 'Forbidden',
      };
    }
    if (!sendVerificationEmailBucket.consume(user.id, 1)) {
      return {
        message: 'Too many requests',
      };
    }

    verificationRequest = await createEmailVerificationRequest(
      user.id,
      user.email
    );
  } else {
    if (!sendVerificationEmailBucket.consume(user.id, 1)) {
      return {
        message: 'Too many requests',
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
    message: 'A new code was sent to your inbox.',
  };
}
