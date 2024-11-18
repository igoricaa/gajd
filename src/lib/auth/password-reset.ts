'use server';

import { encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '../db';
import { passwordResetSession, User, users } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { generateRandomOTP } from './utils';
import { cookies } from 'next/headers';

export async function createPasswordResetSession(
  token: string,
  userId: number,
  email: string
): Promise<PasswordResetSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: PasswordResetSession = {
    id: sessionId,
    userId,
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    code: await generateRandomOTP(),
    emailVerified: false,
    twoFactorVerified: false,
  };

  await db.insert(passwordResetSession).values({
    id: sessionId,
    userId,
    email,
    code: session.code,
    expiresAt: session.expiresAt,
  });

  return session;
}

export async function validatePasswordResetSessionToken(
  token: string
): Promise<PasswordResetSessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db
    .select({
      // Password Reset Session fields
      id: passwordResetSession.id,
      userId: passwordResetSession.userId,
      email: passwordResetSession.email,
      code: passwordResetSession.code,
      expiresAt: passwordResetSession.expiresAt,
      emailVerified: passwordResetSession.emailVerified,
      twoFactorVerified: passwordResetSession.twoFactorVerified,
      // User fields
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        age: users.age,
        email: users.email,
        passwordHash: users.passwordHash,
        githubId: users.githubId,
        emailVerified: users.emailVerified,
        accountType: users.accountType,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
      },
    })
    .from(passwordResetSession)
    .innerJoin(users, eq(users.id, passwordResetSession.userId))
    .where(eq(passwordResetSession.id, sessionId))
    .limit(1);

  // TODO: is this check enough?
  if (result.length === 0) {
    return { session: null, user: null };
  }

  const { user, ...session } = result[0];

  if (Date.now() >= session.expiresAt.getTime()) {
    await db
      .delete(passwordResetSession)
      .where(eq(passwordResetSession.id, session.id));
    return { session: null, user: null };
  }

  return { session, user };
}

export async function validatePasswordResetSessionRequest(): Promise<PasswordResetSessionValidationResult> {
  const token = (await cookies()).get('password_reset_session')?.value;

  if (token === null || token === undefined) {
    return { session: null, user: null };
  }

  const result = await validatePasswordResetSessionToken(token);
  if (result.session === null) {
    await deletePasswordResetSessionTokenCookie();
  }

  return result;
}

export async function setPasswordResetSessionAsEmailVerified(
  sessionId: string
): Promise<void> {
  await db
    .update(passwordResetSession)
    .set({ emailVerified: true })
    .where(eq(passwordResetSession.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(
  userId: number
): Promise<void> {
  await db
    .delete(passwordResetSession)
    .where(eq(passwordResetSession.userId, userId));
}

export async function sendPasswordResetEmail(
  email: string,
  code: string
): Promise<void> {
  console.log(`To ${email}: Your reset code is ${code}`);
}

export async function setPasswordResetSessionTokenCookie(
  token: string,
  expiresAt: Date
) {
  (await cookies()).set('password_reset_session', token, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });
}

export async function deletePasswordResetSessionTokenCookie() {
  (await cookies()).set('password_reset_session', '', {
    maxAge: 0,
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}

export interface PasswordResetSession {
  id: string;
  userId: number;
  email: string;
  expiresAt: Date;
  code: string;
  emailVerified: boolean;
  twoFactorVerified: boolean;
}

export type PasswordResetSessionValidationResult =
  | { session: PasswordResetSession; user: User }
  | { session: null; user: null };
