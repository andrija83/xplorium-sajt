import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/', // Redirect to homepage where SignInModal will open
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isAdmin = auth?.user?.role === 'ADMIN' || auth?.user?.role === 'SUPER_ADMIN'

      if (isOnAdmin) {
        if (isLoggedIn && isAdmin) return true
        return false // Redirect unauthenticated/non-admin users
      }

      return true // Allow access to all other pages
    },
    jwt({ token, user }) {
      if (user) {
        // Add custom fields to JWT token
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
        session.user.id = token.id as string
      }
      return session
    },
  },
  providers: [], // Providers will be added in auth.ts
} satisfies NextAuthConfig
