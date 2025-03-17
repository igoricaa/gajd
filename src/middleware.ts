import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, type SessionJWTPayload } from '@/lib/auth/session';
import { checkRateLimits } from '@/lib/rate-limit/request';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export default async function middleware(
  request: NextRequest
): Promise<NextResponse> {
  const rateLimitResponse = await checkRateLimits(
    request.method as 'GET' | 'POST'
  );
  if (rateLimitResponse) return rateLimitResponse;

  // TODO 
  if (request.nextUrl.pathname.startsWith('/api/uploadthing')) {
    return NextResponse.next();
  }

  let sessionData: SessionJWTPayload | null = null;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionCookie) {
    sessionData = verifyJWT(sessionCookie);

    if (sessionData === null) {
      return new NextResponse(null, { status: 401 });
    }
  }

  const csrfResponse = validateCSRF(request);
  if (csrfResponse) return csrfResponse;

  const authResponse = await validateAuth(request, sessionData);
  if (authResponse) return authResponse;

  if (request.method === 'GET' && sessionCookie && sessionData) {
    return handleSessionCookie(sessionCookie);
  }

  return NextResponse.next();
}

async function validateAuth(
  request: NextRequest,
  sessionData: SessionJWTPayload | null
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    ROUTES.auth.has(pathname) || pathname.startsWith('/dashboard');
  const isPublicRoute = ROUTES.public.has(pathname);

  if (isAuthRoute && !sessionData?.userId) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // if (isPublicRoute && sessionData?.userId) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  return null;
}

export function validateCSRF(request: NextRequest): NextResponse | null {
  if (request.method === 'GET') return null;

  const origin = request.headers.get('Origin');
  const host = request.headers.get('Host');

  if (!origin || !host || origin.split('://')[1] !== host) {
    return new NextResponse(null, { status: 403 });
  }

  return null;
}

export function handleSessionCookie(sessionCookie: string): NextResponse {
  const response = NextResponse.next();
  response.cookies.set('session', sessionCookie, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

interface RouteConfig {
  public: Set<string>;
  auth: Set<string>;
  api: Set<string>;
}

const ROUTES: RouteConfig = {
  public: new Set(['/sign-in', '/sign-up', '/', '/reset-password']),
  auth: new Set(['/dashboard', '/settings']),
  api: new Set(['/api']),
} as const;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
