import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, type SessionJWTPayload } from '@/lib/auth/session';

const PUBLIC_ROUTES = new Set(['/sign-in', '/sign-up', '/', '/reset-password']);
const AUTH_ROUTES = new Set(['/dashboard', '/settings']);
const API_ROUTES = new Set(['/api']);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  debugger;
  const isAuthRoute =
    AUTH_ROUTES.has(pathname) || pathname.startsWith('/dashboard');
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  let sessionData: SessionJWTPayload | null = null;

  const sessionCookie = request.cookies.get('session')?.value;
  if (sessionCookie) {
    sessionData = await verifyJWT(sessionCookie);
  }

  if (isAuthRoute && !sessionData?.userId) {
    const redirectUrl = new URL('/sign-in', request.url);
    // TODO: ima from query param, da li je to za redirekciju nakon logina?
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicRoute && sessionData?.userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle session cookie refresh for GET requests
  if (request.method === 'GET' && sessionCookie && sessionData) {
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

  // CSRF protection for non-GET requests
  if (request.method !== 'GET') {
    const origin = request.headers.get('Origin');
    const host = request.headers.get('Host');

    if (!origin || !host) {
      return new NextResponse(null, { status: 403 });
    }

    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return new NextResponse(null, { status: 403 });
      }
    } catch {
      return new NextResponse(null, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
