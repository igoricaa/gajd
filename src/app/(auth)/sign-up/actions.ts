'use server';

import { checkEmailAvailability, verifyEmailInput } from '@/lib/data/email';
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
} from '@/lib/data/email-verification';
import { verifyPasswordStrength } from '@/lib/auth/password';
import { createUser, verifyUsernameInput } from '@/lib/data/user';
import { signUpIpBucket } from '@/lib/rate-limit/config';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';

interface SignUpInput {
  email: string;
  username: string;
  password: string;
}

async function validateSignUpInput(
  formData: FormData
): Promise<ActionResult | SignUpInput> {
  const email = formData.get('email');
  const username = formData.get('username');
  const password = formData.get('password');

  if (
    typeof email !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return { message: AUTH_ERROR_MESSAGES.INVALID_FIELDS };
  }

  if (email === '' || password === '' || username === '') {
    return {
      message: AUTH_ERROR_MESSAGES.EMPTY_USERNAME_EMAIL_PASSWORD_FIELDS,
    };
  }

  if (!(await verifyEmailInput(email))) {
    return { message: AUTH_ERROR_MESSAGES.INVALID_EMAIL };
  }

  if (!(await checkEmailAvailability(email))) {
    return { message: AUTH_ERROR_MESSAGES.EMAIL_IN_USE };
  }

  if (!(await verifyUsernameInput(username))) {
    return { message: AUTH_ERROR_MESSAGES.INVALID_USERNAME };
  }

  if (!(await verifyPasswordStrength(password))) {
    return { message: AUTH_ERROR_MESSAGES.WEAK_PASSWORD };
  }

  return { email, username, password };
}

const getClientIP = async (): Promise<string | null> => {
  const headersList = await headers();
  return (
    headersList.get('X-Forwarded-For') ||
    headersList.get('X-Real-IP') ||
    headersList.get('Remote-Addr') ||
    null
  );
};

export async function signUpAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return { message: AUTH_ERROR_MESSAGES.RATE_LIMIT };
  }

  const clientIP = await getClientIP();
  if (clientIP && !signUpIpBucket.check(clientIP, 1)) {
    return { message: AUTH_ERROR_MESSAGES.RATE_LIMIT };
  }

  const validationResult = await validateSignUpInput(formData);
  if ('message' in validationResult) {
    return validationResult;
  }

  if (clientIP !== null && !signUpIpBucket.consume(clientIP, 1)) {
    return { message: AUTH_ERROR_MESSAGES.RATE_LIMIT };
  }

  const user = await createUser(
    validationResult.email,
    validationResult.username,
    validationResult.password
  );
  const emailVerificationRequest = await createEmailVerificationRequest(
    user.id,
    user.email
  );

  await Promise.all([
    sendVerificationEmail(
      emailVerificationRequest.email,
      emailVerificationRequest.code
    ),
    setEmailVerificationRequestCookie(emailVerificationRequest),
    createSession(user.id),
  ]);

  return redirect('/');
}
