'use server';

import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import { User, users } from '../db/schema';
import { SHA256, sha256 } from '@oslojs/crypto/sha2';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { sessions } from '../db/schema';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { hmac } from '@oslojs/crypto/hmac';
import {
  joseAlgorithmHS256,
  createJWTSignatureMessage,
  encodeJWT,
  parseJWT,
  JWSRegisteredHeaders,
  JWTClaims,
} from '@oslojs/jwt';

const SESSION_COOKIE_NAME = 'session';
const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function generateSessionToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function createSession(userId: number): Promise<Session> {
  const token = await generateSessionToken();
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const jwt = await createJWT(userId, sessionId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });

  const session: Session = {
    id: sessionId,
    userId,
    expiresAt,
  };

  // await db.insert(sessions).values(session);

  return session;
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

    if (sessionCookie === null) {
      return { sessionId: null };
    }

    const [token, jwt] = sessionCookie.split('.');

    if (token === null || jwt === null) {
      return { sessionId: null };
    }

    // const result = await validateSessionToken(token);

    const jwtPayload = await verifyJWT(jwt);

    if (jwtPayload === null) {
      return { sessionId: null };
    }

    return { sessionId: jwtPayload.sessionId };
  }
);

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// export async function validateSessionToken(
//   token: string
// ): Promise<SessionValidationResult> {
//   const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
//   const result = await db
//     .select({ user: users, session: sessions })
//     .from(sessions)
//     .innerJoin(users, eq(sessions.userId, users.id))
//     .where(eq(sessions.id, sessionId));

//   if (result.length < 1) {
//     return { session: null, user: null };
//   }

//   const { user, session } = result[0];

//   if (Date.now() >= session.expiresAt.getTime()) {
//     await db.delete(sessions).where(eq(sessions.id, session.id));
//     return { session: null, user: null };
//   }
//   if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
//     session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
//     await db
//       .update(sessions)
//       .set({ expiresAt: session.expiresAt })
//       .where(eq(sessions.id, session.id));
//   }

//   return { session, user };
// }

// export async function invalidateSession(sessionId: string): Promise<void> {
//   await db.delete(sessions).where(eq(sessions.id, sessionId));
// }

// export async function invalidateUserSessions(userId: number): Promise<void> {
//   await db.delete(sessions).where(eq(sessions.userId, userId));
// }

// export async function setSessionTokenCookie(
//   token: string,
//   expiresAt: Date,
//   userId: number,
//   sessionId: string,
// ): Promise<void> {
//   const cookieStore = await cookies();

//   const jwt = await createJWT(userId, sessionId, expiresAt);

//   cookieStore.set(SESSION_COOKIE_NAME, `${token}.${jwt}`, {
//     httpOnly: true,
//     sameSite: 'lax',
//     secure: process.env.NODE_ENV === 'production',
//     expires: expiresAt,
//     path: '/',
//   });
// }

// export async function deleteSessionTokenCookie(): Promise<void> {
//   const cookieStore = await cookies();
//   cookieStore.set(SESSION_COOKIE_NAME, '', {
//     httpOnly: true,
//     sameSite: 'lax',
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 0,
//     path: '/',
//   });
// }

// JWT
export async function createJWT(
  userId: number,
  sessionId: string,
  expiresAt: Date
): Promise<string> {
  const header = JSON.stringify({ alg: joseAlgorithmHS256, typ: 'JWT' });
  const payload = JSON.stringify({
    userId,
    sessionId,
    exp: Math.floor(expiresAt.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
    // TODO: iss: 'gajd.dev',
  });

  const signatureMessage = createJWTSignatureMessage(header, payload);
  const signature = hmac(SHA256, JWT_SECRET_KEY, signatureMessage);
  const jwt = encodeJWT(header, payload, signature);

  return jwt;
}

export async function verifyJWT(
  jwt: string
): Promise<SessionJWTPayload | null> {
  try {
    const [header, payload, signature, signatureMessage] = parseJWT(jwt);

    const expectedSignature = hmac(
      SHA256,
      new TextEncoder().encode(process.env.JWT_SECRET),
      signatureMessage
    );

    const validSignature =
      signature.length === expectedSignature.length &&
      constantTimeCompare(signature, expectedSignature);

    const areClaimsValid = validateClaims(payload);
    const areHeadersValid = validateHeaders(header);

    if (!validSignature || !areClaimsValid || !areHeadersValid) {
      return null;
    } else {
      return payload as SessionJWTPayload;
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

function validateHeaders(header: object) {
  const headers = new JWSRegisteredHeaders(header);

  if (headers.hasAlgorithm() && headers.algorithm() !== joseAlgorithmHS256) {
    throw new Error('Invalid algorithm');
  }

  return true;
}

function validateClaims(payload: object) {
  const claims = new JWTClaims(payload);

  if (claims.hasExpiration() && !claims.verifyExpiration()) {
    throw new Error('Token has expired');
  }

  // if (claims.hasIssuer() && claims.issuer() !== 'your-app') {
  //   throw new Error('Invalid issuer');
  // }

  return true;
}

// Helper functions
// export async function getSessionToken(): Promise<string | undefined> {
//   const cookieStore = await cookies();
//   return cookieStore.get(SESSION_COOKIE_NAME)?.value;
// }

export interface Session {
  id: string;
  expiresAt: Date;
  userId: number;
}

export type SessionValidationResult = { sessionId: string | null };

export interface SessionCookie {
  userId: number;
  expiresAt: number;
}

export interface SessionJWTPayload {
  userId: number;
  sessionId: string;
  exp?: number;
}
