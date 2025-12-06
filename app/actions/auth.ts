'use server'

import { prisma } from '@/lib/db'
import { hashPassword, comparePassword } from '@/lib/password'
import { logger } from '@/lib/logger'
import { signUpSchema, signInSchema, type SignUpInput } from '@/lib/validations'
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
 * Verify user credentials without creating a session
 * The actual session is created client-side via NextAuth signIn
 * @param email - User email
 * @param password - User password
 * @returns Standardized response with user data if valid
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<StandardResponse<{ valid: boolean; userId?: string }>> {
  try {
    // Rate limit by email to prevent brute force attacks
    const rateLimitResult = await checkRateLimit(email, authRateLimit)

    if (!rateLimitResult.success) {
      logger.warn('Sign in rate limit exceeded', { email })
      const retryAfterSeconds = rateLimitResult.reset - Math.floor(Date.now() / 1000)
      throw new RateLimitError(retryAfterSeconds)
    }

    // Validate input
    const validatedFields = signInSchema.safeParse({ email, password })
    if (!validatedFields.success) {
      throw new AuthenticationError('Invalid email or password format')
    }

    logger.auth('Verifying credentials for:', { email })

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        blocked: true,
      },
    })

    if (!user || !user.password) {
      logger.auth('User not found:', { email })
      throw new AuthenticationError('Invalid email or password')
    }

    if (user.blocked) {
      logger.auth('User is blocked:', { email })
      throw new AuthenticationError('Account has been blocked. Please contact support.')
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      logger.auth('Invalid password for:', { email })
      throw new AuthenticationError('Invalid email or password')
    }

    logger.auth('Credentials verified for:', { email })
    return createSuccessResponse({ valid: true, userId: user.id })
  } catch (error) {
    return handleServerError('verifyCredentials', error)
  }
}

/**
 * Sign in a user - validates and returns success for client to complete sign in
 * @deprecated Use verifyCredentials instead for pre-validation
 */
export async function signInAction(
  email: string,
  password: string
): Promise<StandardResponse<{ message: string }>> {
  try {
    // Verify credentials first
    const result = await verifyCredentials(email, password)

    if (!result.success) {
      return result as StandardResponse<{ message: string }>
    }

    return createSuccessResponse({ message: 'Credentials verified. Completing sign in...' })
  } catch (error) {
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
