import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth

  // Protect admin routes - require ADMIN or SUPER_ADMIN role
  if (!session?.user) {
    // Not authenticated - redirect to home
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    // Authenticated but not admin - redirect to home
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Only match admin routes to reduce bundle size
  matcher: ['/admin/:path*'],
}
