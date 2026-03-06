import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicPath = path === '/login';
    const token = request.cookies.get('auth-token')?.value || '';
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/clinics', request.nextUrl));
    }
}
export const config = {
    matcher: [
        '/clinics',
        '/clinics/:path*',
        '/login'
    ]
};