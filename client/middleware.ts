import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token) {
        try {
            const payload = decodeJwt(token) as any;
            const { role, permissions } = payload;

            if (request.nextUrl.pathname.startsWith('/admin-only')) {
                const isDenied = permissions.deny.includes('admin.access');
                if (role !== 'admin' || isDenied) {
                    return NextResponse.redirect(new URL('/403', request.url));
                }
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}