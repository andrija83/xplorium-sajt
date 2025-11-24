import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

// CSP configuration - allows necessary third-party services while maintaining security
// In development, React Server Components require 'unsafe-eval' for module loading
// Only disable 'unsafe-eval' in production for security
const isProduction = process.env.NODE_ENV === 'production'
const CSP_HEADER = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${!isProduction ? "'unsafe-eval'" : ''} https://va.vercel-scripts.com https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https:;
    connect-src 'self' https://va.vercel-scripts.com https://vercel.live;
    frame-src 'self';
`.replace(/\s{2,}/g, ' ').trim()

function addSecurityHeaders(response: NextResponse, includeCache = false) {
    if (includeCache) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
    }
    response.headers.set('Content-Security-Policy', CSP_HEADER)
    return response
}

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

        // Admin is authorized - add security and cache control headers
        return addSecurityHeaders(NextResponse.next(), true)
    }

    // Protect profile routes - require login but any user role
    if (isProfileRoute) {
        if (!isLoggedIn) {
            // Not logged in - redirect to home
            return NextResponse.redirect(new URL('/', nextUrl))
        }

        // Logged in user is authorized - add security and cache control headers
        return addSecurityHeaders(NextResponse.next(), true)
    }

    // Add CSP headers for all other routes
    return addSecurityHeaders(NextResponse.next())
})

// Run middleware on all routes to apply CSP headers
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
