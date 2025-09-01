import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  const protectedRoutes = ['/meet', '/interview'];
  const pathname = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  console.log('Middleware check:', { pathname, isProtectedRoute });

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value;

    console.log('Token check:', { hasToken: !!token });

    if (!token) {
      // No token found, redirect to login
      console.log('No token, redirecting to login');
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // Verify the token using jose (Edge Runtime compatible)
      await jwtVerify(token, JWT_SECRET);
      // Token is valid, allow the request to continue
      console.log('Token valid, allowing access');
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      console.error('Invalid token:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Not a protected route, allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};