import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const TOKEN_NAME = 'sc_qpms_auth_token';

const PROTECTED_ROUTES: Record<string, string[]> = {
  '/setter': ['Question Setter', 'Admin'],
  '/reviewer': ['Reviewer', 'Admin'],
  '/authority': ['Examination Authority', 'Admin'],
  '/exam-center': ['Examination Center', 'Admin'],
  '/admin': ['Admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname matches any protected path
  const matchingPath = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  const token = request.cookies.get(TOKEN_NAME)?.value;

  if (matchingPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_middleware_development_32_chars');
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as any).role;
      const allowedRoles = PROTECTED_ROUTES[matchingPath];

      if (!allowedRoles.includes(userRole)) {
        // Redirect to their permitted dashboard or unauthorized page
        const unauthorizedUrl = new URL('/login?error=unauthorized_role', request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
    } catch {
      // Token invalid or expired
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(TOKEN_NAME);
      return response;
    }
  }

  // If already authenticated and visiting /login, redirect to their role dashboard
  if (pathname === '/login' && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_middleware_development_32_chars');
      const { payload } = await jwtVerify(token, secret);
      const role = (payload as any).role;

      let redirectPath = '/setter';
      if (role === 'Reviewer') redirectPath = '/reviewer';
      else if (role === 'Examination Authority') redirectPath = '/authority';
      else if (role === 'Examination Center') redirectPath = '/exam-center';
      else if (role === 'Admin') redirectPath = '/admin';

      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch {
      // Continue to login if token is corrupt
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/setter/:path*',
    '/reviewer/:path*',
    '/authority/:path*',
    '/exam-center/:path*',
    '/admin/:path*',
    '/login',
  ],
};
