import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import { AccessTokenPayload } from '@/types/auth';
import { canAccessRoute } from '@/lib/permission-logic';
import { PUBLIC_ROUTES, AUTH_ROUTES, ROUTES } from '@/config/routes';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('accessToken')?.value;

    /* ---- Public routes: không cần auth ---- */
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    /* ---- Đã login mà vào auth pages (login/register) → redirect dashboard ---- */
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    if (isAuthRoute && token) {
        try {
            decodeJwt(token); // verify decodable
            return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
        } catch {
            // Token lỗi → cho vào login bình thường
        }
    }

    if (isPublicRoute) {
        return NextResponse.next();
    }

    /* ---- Dashboard routes: cần auth ---- */
    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const payload = decodeJwt(token) as unknown as AccessTokenPayload;

            // Check role-based access
            if (!canAccessRoute(payload, pathname)) {
                // Rewrite to not-found → user thấy 404, không biết trang tồn tại
                return NextResponse.rewrite(new URL('/not-found', request.url));
            }
        } catch {
            // Token lỗi → redirect login
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match tất cả routes ngoại trừ:
         * - api routes
         * - _next static files
         * - _next images
         * - favicon
         * - public assets
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};