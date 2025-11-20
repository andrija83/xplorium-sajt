import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    const isAdminRoute = nextUrl.pathname.startsWith('/admin')
    const isProfileRoute = nextUrl.pathname.startsWith('/profile')

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

    // Protect profile routes - require login but any user role
    if (isProfileRoute) {
        if (!isLoggedIn) {
            // Not logged in - redirect to home
            return NextResponse.redirect(new URL('/', nextUrl))
        }

        // Logged in user is authorized
        const response = NextResponse.next()
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        return response
    }

    return NextResponse.next()
})

// Specify which routes to run middleware on
// Only protect admin routes and profile - public routes are left alone for static caching
export const config = {
    matcher: [
        '/admin/:path*',
        '/profile/:path*',
    ],
}
