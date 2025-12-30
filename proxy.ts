// Proxy for authentication and route protection (Next.js 16)
// Verifies JWT tokens and protects admin/API routes
// Links to: @/lib/auth.ts (JWT verification), Admin routes
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Public routes - allow lottery results API to be accessed without auth
  const publicApiRoutes = [
    '/api/lottery-results',
    '/api/market-sessions',
  ];
  
  const isPublicApi = publicApiRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Allow GET /api/market-index without auth (for mobile/public access)
  // PUT /api/market-index still requires auth
  // Links to: @/app/components/StockInfo.tsx (fetches market index), @/app/api/market-index/route.ts (GET/PUT handlers)
  const isPublicMarketIndexGet = pathname === '/api/market-index' && method === 'GET';

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify JWT token
    const verified = await verifySessionToken(token);
    if (!verified) {
      // Invalid or expired token - redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Protect API routes (except auth routes, public routes, and GET /api/market-index)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !isPublicApi && !isPublicMarketIndexGet) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const verified = await verifySessionToken(token);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};

