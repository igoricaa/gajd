import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // TODO: add auth here: https://www.youtube.com/watch?v=N_sUsq_y10U - middleware
  // Basic auth validation
  // Token presence check
  // Public routes whitelist
  // Basic role checks

  // on the protected pages:
  // Complex permission checks
  // User-specific logic
  // Feature-based access control

  // const path = request.nextUrl.pathname;
  // const isProtectedRoute = protectedRoutes.includes(path);
  // const isPublicRoute = publicRoutes.includes(path);

  // // 3. Decrypt the session from the cookie
  // const token = request.cookies.get('session')?.value ?? null;
  // // const session = decrypt(token);

  // // 4. Redirect to /login if the user is not authenticated
  // if (isProtectedRoute && !session?.userId) {
  //   return NextResponse.redirect(new URL('/login', request.nextUrl));
  // }

  // // 5. Redirect to /dashboard if the user is authenticated
  // if (
  //   isPublicRoute &&
  //   session?.userId &&
  //   !request.nextUrl.pathname.startsWith('/dashboard')
  // ) {
  //   return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  // }

  if (request.method === 'GET') {
    const response = NextResponse.next();
    const token = request.cookies.get('session')?.value ?? null;
    if (token !== null) {
      response.cookies.set('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  }

  const originHeader = request.headers.get('Origin');
  // NOTE: You may need to use `X-Forwarded-Host` instead - vaj?
  const hostHeader = request.headers.get('Host');
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch (error) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  if (origin.host !== hostHeader) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  return NextResponse.next();
}
