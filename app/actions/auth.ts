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
  // Use console.log directly for production debugging (temporarily)
  const log = (step: string, data?: object) => {
    console.log(`[verifyCredentials] ${step}`, JSON.stringify(data || {}))
  }

  log('START', { email, timestamp: new Date().toISOString(), nodeEnv: process.env.NODE_ENV })

  try {
    // Step 1: Rate limiting
    log('Step 1: Checking rate limit')
    let rateLimitResult
    try {
      rateLimitResult = await checkRateLimit(email, authRateLimit)
      log('Rate limit check passed', { success: rateLimitResult.success, remaining: rateLimitResult.remaining })
    } catch (rateLimitError) {
      const errMsg = rateLimitError instanceof Error ? rateLimitError.message : String(rateLimitError)
      log('Rate limit check FAILED', { error: errMsg })
      console.error('[verifyCredentials] Rate limit error:', rateLimitError)
      throw rateLimitError
    }

    if (!rateLimitResult.success) {
      log('Rate limit exceeded')
      const retryAfterSeconds = rateLimitResult.reset - Math.floor(Date.now() / 1000)
      throw new RateLimitError(retryAfterSeconds)
    }

    // Step 2: Validate input
    log('Step 2: Validating input')
    const validatedFields = signInSchema.safeParse({ email, password })
    if (!validatedFields.success) {
      log('Input validation failed', { errors: validatedFields.error.errors.map(e => e.message) })
      throw new AuthenticationError('Invalid email or password format')
    }
    log('Input validation passed')

    // Step 3: Find user in database
    log('Step 3: Finding user in database')
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          password: true,
          blocked: true,
        },
      })
      log('Database query completed', { userFound: !!user, userId: user?.id })
    } catch (dbError) {
      const errMsg = dbError instanceof Error ? dbError.message : String(dbError)
      log('Database query FAILED', { error: errMsg })
      console.error('[verifyCredentials] Database error:', dbError)
      throw dbError
    }

    if (!user || !user.password) {
      log('User not found or no password')
      throw new AuthenticationError('Invalid email or password')
    }

    if (user.blocked) {
      log('User is blocked')
      throw new AuthenticationError('Account has been blocked. Please contact support.')
    }

    // Step 4: Verify password
    log('Step 4: Verifying password')
    let isValidPassword
    try {
      isValidPassword = await comparePassword(password, user.password)
      log('Password comparison completed', { isValid: isValidPassword })
    } catch (bcryptError) {
      const errMsg = bcryptError instanceof Error ? bcryptError.message : String(bcryptError)
      log('Password comparison FAILED', { error: errMsg })
      console.error('[verifyCredentials] Bcrypt error:', bcryptError)
      throw bcryptError
    }

    if (!isValidPassword) {
      log('Invalid password')
      throw new AuthenticationError('Invalid email or password')
    }

    log('SUCCESS - Credentials verified', { userId: user.id })
    return createSuccessResponse({ valid: true, userId: user.id })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    const errName = error instanceof Error ? error.name : 'Unknown'
    log('CAUGHT ERROR', { errorName: errName, errorMessage: errMsg })
    console.error('[verifyCredentials] Full error:', error)
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
