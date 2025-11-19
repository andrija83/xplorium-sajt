import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { signInSchema } from './validations'

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
          console.log('[AUTH] authorize() called with email:', credentials?.email)

          // Load dependencies
          await loadDependencies()

          // Validate credentials
          const validatedFields = signInSchema.safeParse(credentials)

          if (!validatedFields.success) {
            console.log('[AUTH] Validation failed:', validatedFields.error)
            return null
          }

          const { email, password } = validatedFields.data

          // Find user by email
          console.log('[AUTH] Looking up user:', email)
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
            console.log('[AUTH] User not found or no password')
            return null
          }

          console.log('[AUTH] User found:', { email: user.email, role: user.role })

          // Check if user is blocked
          if (user.blocked) {
            console.log('[AUTH] User is blocked')
            throw new Error('Account has been blocked. Please contact support.')
          }

          // Verify password
          const isValidPassword = await comparePassword(password, user.password)

          if (!isValidPassword) {
            console.log('[AUTH] Invalid password')
            return null
          }

          console.log('[AUTH] Authentication successful')

          // Return user without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          console.error('[AUTH] authorize() error:', error)
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
})
