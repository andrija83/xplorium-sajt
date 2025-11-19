import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    const isAdminRoute = nextUrl.pathname.startsWith('/admin')

    // Protect admin routes
    if (isAdminRoute) {
        if (!isLoggedIn) {
            // Not logged in - redirect to home
            return NextResponse.redirect(new URL('/', nextUrl))
        }

        if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole || '')) {
            // Logged in but not admin - redirect to home
            return NextResponse.redirect(new URL('/', nextUrl))
        }

        // Admin is authorized - add cache control headers to prevent back button access
        const response = NextResponse.next()
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        return response
    }

    return NextResponse.next()
})

// Specify which routes to run middleware on
export const config = {
    matcher: [
        '/admin/:path*',
        // Exclude static files and API routes
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
