'use server';

import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import { User, users } from '../db/schema';
import { sha256 } from '@oslojs/crypto/sha2';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { sessions } from '../db/schema';
import { cookies } from 'next/headers';
import { cache } from 'react';

const SESSION_COOKIE_NAME = 'session';

export async function generateSessionToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function createSession(
  token: string,
  userId: number,
  flags: SessionFlags
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    twoFactorVerified: flags.twoFactorVerified,
  };

  await db.insert(sessions).values(session);

  return session;
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId));

  if (result.length < 1) {
    return { session: null, user: null };
  }

  const { user, session } = result[0];

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessions)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessions.id, session.id));
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
    if (token === null) {
      return { session: null, user: null };
    }

    const result = await validateSessionToken(token);
    return result;
  }
);

export async function setSessionAs2FAVerified(
  sessionId: string
): Promise<void> {
  await db
    .update(sessions)
    .set({ twoFactorVerified: true })
    .where(eq(sessions.id, sessionId));
}

// Helper functions
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function setSession(userId: number, flags: SessionFlags) {
  const token = await generateSessionToken();
  const session = await createSession(token, userId, flags);
  await setSessionTokenCookie(token, session.expiresAt);
}

export interface SessionFlags {
  twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
  id: string;
  expiresAt: Date;
  userId: number;
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
