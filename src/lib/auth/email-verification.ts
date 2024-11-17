'use server';

import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { emailVerificationRequest } from '../db/schema';
import { encodeBase32 } from '@oslojs/encoding';
import { generateRandomOTP } from './utils';
import { cookies } from 'next/headers';
import { getCurrentSession } from './session';
import { EmailVerificationRequest } from '../types';

export async function getUserEmailVerificationRequest(
  userId: number,
  id: string
): Promise<EmailVerificationRequest | null> {
  const request = await db
    .select({
      id: emailVerificationRequest.id,
      userId: emailVerificationRequest.userId,
      code: emailVerificationRequest.code,
      email: emailVerificationRequest.email,
      expiresAt: emailVerificationRequest.expiresAt,
    })
    .from(emailVerificationRequest)
    .where(
      and(
        eq(emailVerificationRequest.userId, userId),
        eq(emailVerificationRequest.id, id)
      )
    )
    .limit(1);

  if (request.length < 1) {
    return null;
  }

  return request[0];
}

export async function createEmailVerificationRequest(
  userId: number,
  email: string
): Promise<EmailVerificationRequest> {
  deleteUserEmailVerificationRequest(userId);

  const idBytes = new Uint8Array(20);
  crypto.getRandomValues(idBytes);
  const id = encodeBase32(idBytes).toLowerCase();

  const code = await generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  await db.insert(emailVerificationRequest).values({
    id,
    userId,
    code,
    email,
    // TODO: zasto je ovako setovao expiresAt?Math.floor(expiresAt.getTime() / 1000)
    expiresAt,
  });

  const request: EmailVerificationRequest = {
    id,
    userId,
    code,
    email,
    expiresAt,
  };

  return request;
}

export async function deleteUserEmailVerificationRequest(userId: number) {
  await db
    .delete(emailVerificationRequest)
    .where(eq(emailVerificationRequest.userId, userId));
}

export async function sendVerificationEmail(email: string, code: string) {
  //TODO: Implement email sending
  console.log(`To ${email}: Your verification code is ${code}`);
}

export async function setEmailVerificationRequestCookie(
  request: EmailVerificationRequest
): Promise<void> {
  (await cookies()).set('email_verification', request.id, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: request.expiresAt,
  });
}

export async function getUserEmailVerificationRequestFromRequest(): Promise<EmailVerificationRequest | null> {
  const { user } = await getCurrentSession();
  if (user === null) {
    return null;
  }

  const id = (await cookies()).get('email_verification')?.value ?? null;
  if (id === null) {
    return null;
  }

  const request = await getUserEmailVerificationRequest(user.id, id);
  if (request === null) {
    return null;
  }

  return request;
}

export async function deleteEmailVerificationRequestCookie(): Promise<void> {
  (await cookies()).set('email_verification', '', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
}
