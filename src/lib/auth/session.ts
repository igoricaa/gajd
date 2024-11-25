'use server';

import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import { SHA256, sha256 } from '@oslojs/crypto/sha2';
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
import {
  SESSION_DURATION,
  SESSION_COOKIE_NAME,
  SESSION_RENEWAL_THRESHOLD,
  JWT_SECRET_KEY,
} from '../constants';

export async function generateSessionToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function createSession(userId: number): Promise<Session> {
  const token = await generateSessionToken();
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const jwt = await createJWT(userId, sessionId, expiresAt);
  await saveSessionCookie(jwt, expiresAt);

  const session: Session = {
    id: sessionId,
    userId,
    expiresAt,
  };

  return session;
}

export const verifySession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies();
    // TODO: rename to jwt?
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

    if (sessionCookie === null) {
      return { sessionId: null, userId: null };
    }

    const jwtPayload = await verifyJWT(sessionCookie);

    if (jwtPayload === null) {
      return { sessionId: null, userId: null };
    }

    let expirationDate = new Date(jwtPayload.exp * 1000);

    if (Date.now() >= expirationDate.getTime()) {
      await deleteSession();
      return { sessionId: null, userId: null };
    }
    if (Date.now() >= expirationDate.getTime() - SESSION_RENEWAL_THRESHOLD) {
      expirationDate = new Date(Date.now() + SESSION_DURATION);

      const jwt = await createJWT(
        jwtPayload.userId,
        jwtPayload.sessionId,
        expirationDate
      );

      await saveSessionCookie(jwt, expirationDate);
    }

    return {
      sessionId: jwtPayload.sessionId,
      userId: jwtPayload.userId,
    };
  }
);

async function saveSessionCookie(jwt: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

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
    // TODO: math.floor? why?
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

    const expectedSignature = hmac(SHA256, JWT_SECRET_KEY, signatureMessage);

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

export type SessionValidationResult = {
  sessionId: string | null;
  userId: number | null;
};

export interface SessionCookie {
  userId: number;
  expiresAt: number;
}

export interface SessionJWTPayload {
  userId: number;
  sessionId: string;
  exp: number;
}
