import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { signInSchema } from './validations'
import { logger } from './logger'

// Lazy imports to avoid circular dependencies and allow build to succeed
// These will be imported when actually needed
let prisma: any
let comparePassword: any

async function loadDependencies() {
  if (!prisma) {
    const dbModule = await import('./db')
    prisma = dbModule.prisma
  }
  if (!comparePassword) {
    const passwordModule = await import('./password')
    comparePassword = passwordModule.comparePassword
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          logger.auth('authorize() called', { email: credentials?.email })

          // Load dependencies
          await loadDependencies()

          // Validate credentials
          const validatedFields = signInSchema.safeParse(credentials)

          if (!validatedFields.success) {
            logger.auth('Validation failed', { error: validatedFields.error })
            return null
          }

          const { email, password } = validatedFields.data

          // Find user by email
          logger.auth('Looking up user', { email })
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              image: true,
              blocked: true,
            },
          })

          // Check if user exists
          if (!user || !user.password) {
            logger.auth('User not found or no password')
            return null
          }

          logger.auth('User found', { email: user.email, role: user.role })

          // Check if user is blocked
          if (user.blocked) {
            logger.auth('User is blocked', { email })
            throw new Error('Account has been blocked. Please contact support.')
          }

          // Verify password
          const isValidPassword = await comparePassword(password, user.password)

          if (!isValidPassword) {
            logger.auth('Invalid password', { email })
            return null
          }

          logger.auth('Authentication successful', { email })

          // Return user without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          logger.error('authorize() error', error instanceof Error ? error : new Error(String(error)))
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days for regular users
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.lastActivity = Date.now()
      }

      // Session update or token refresh
      if (trigger === 'update') {
        token.lastActivity = Date.now()
      }

      // Check admin inactivity timeout (30 minutes)
      if (token.role === 'ADMIN' || token.role === 'SUPER_ADMIN') {
        const lastActivity = token.lastActivity as number
        const inactivityTimeout = 30 * 60 * 1000 // 30 minutes in milliseconds
        const now = Date.now()

        if (now - lastActivity > inactivityTimeout) {
          // Session expired due to inactivity
          return null // Return null to invalidate session
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
})
