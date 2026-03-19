import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/ngo-dashboard', '/admin-dashboard', '/profile'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Check if the path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Optional: Verify token validity here if you want strict security at edge
        // Note: verifyJWT needs to be edge-compatible (jose is)
        const payload = await verifyJWT(token);
        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isAuthRoute && token) {
        // If already logged in, redirect to dashboard
        // We might want to check role to redirect to correct dashboard
        // For now, default to main dashboard or let the page handle it
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

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
