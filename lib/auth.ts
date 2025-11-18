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
        // Load dependencies
        await loadDependencies()

        // Validate credentials
        const validatedFields = signInSchema.safeParse(credentials)

        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        // Find user by email
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
          return null
        }

        // Check if user is blocked
        if (user.blocked) {
          throw new Error('Account has been blocked. Please contact support.')
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password)

        if (!isValidPassword) {
          return null
        }

        // Return user without password
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
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
