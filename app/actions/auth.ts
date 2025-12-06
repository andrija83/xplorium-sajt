'use server'

import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { logger } from '@/lib/logger'
import { signUpSchema, type SignUpInput } from '@/lib/validations'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { authRateLimit, strictRateLimit, checkRateLimit } from '@/lib/rate-limit'
import {
  ConflictError,
  RateLimitError,
  AuthenticationError,
} from '@/lib/errors/api-error'
import {
  createSuccessResponse,
  handleServerError,
  type StandardResponse,
} from '@/lib/utils/error-handler'

/**
 * Sign up a new user with rate limiting
 * @param data - User registration data
 * @returns Standardized response with user data
 */
export async function signUp(
  data: SignUpInput
): Promise<StandardResponse<{ id: string; name: string | null; email: string; role: string }>> {
  try {
    // Validate input (Zod errors are automatically handled)
    const validatedData = signUpSchema.parse(data)

    // Rate limit by email to prevent spam registrations
    const rateLimitResult = await checkRateLimit(validatedData.email, authRateLimit)

    if (!rateLimitResult.success) {
      logger.warn('Sign up rate limit exceeded', {
        email: validatedData.email,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset * 1000).toISOString(),
      })

      const retryAfterSeconds = rateLimitResult.reset - Math.floor(Date.now() / 1000)
      throw new RateLimitError(retryAfterSeconds)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists', {
        field: 'email',
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER', // Default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    logger.info('User registered successfully', { userId: user.id, email: user.email })

    return createSuccessResponse(user, 'Account created successfully')
  } catch (error) {
    return handleServerError('signUp', error)
  }
}

/**
 * Sign in a user using NextAuth with rate limiting
 * @param email - User email
 * @param password - User password
 * @returns Standardized response with success message
 */
export async function signInAction(
  email: string,
  password: string
): Promise<StandardResponse<{ message: string }>> {
  try {
    // Rate limit by email to prevent brute force attacks
    const rateLimitResult = await checkRateLimit(email, authRateLimit)

    if (!rateLimitResult.success) {
      logger.warn('Sign in rate limit exceeded', {
        email,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset * 1000).toISOString(),
      })

      const retryAfterSeconds = rateLimitResult.reset - Math.floor(Date.now() / 1000)
      throw new RateLimitError(retryAfterSeconds)
    }

    logger.auth('Attempting sign in for:', { email })

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    logger.auth('Sign in successful:', { email })

    return createSuccessResponse({ message: 'Signed in successfully' })
  } catch (error) {
    // Handle NextAuth specific errors
    if (error instanceof AuthError) {
      logger.auth('AuthError type:', { type: error.type })

      switch (error.type) {
        case 'CredentialsSignin':
          return handleServerError('signInAction', new AuthenticationError('Invalid email or password'))
        case 'CallbackRouteError':
          return handleServerError('signInAction', new AuthenticationError('Authentication callback failed. Please check your credentials.'))
        default:
          return handleServerError('signInAction', new AuthenticationError(`Authentication failed: ${error.type}`))
      }
    }

    return handleServerError('signInAction', error)
  }
}

/**
 * Reset password (Mock implementation)
 * @param email - User email
 * @returns Success status
 */
export async function resetPassword(email: string) {
  try {
    // Rate limit password reset requests (3 per hour per email)
    const rateLimitResult = await checkRateLimit(email, strictRateLimit)

    if (!rateLimitResult.success) {
      logger.warn('Password reset rate limit exceeded', { email })
      return {
        success: false,
        error: `Too many reset attempts. Please try again in ${Math.ceil((rateLimitResult.reset * 1000 - Date.now()) / 60000)} minutes.`,
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // TODO: Integrate Resend here
    // See TODO_RESEND_MIGRATION.md

    logger.info('Password reset requested', { email })

    return {
      success: true,
      message: 'Reset link sent successfully',
    }
  } catch (error) {
    logger.serverActionError('resetPassword', error)
    return {
      success: false,
      error: 'Failed to send reset link',
    }
  }
}
