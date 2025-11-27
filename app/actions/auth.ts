'use server'

import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { logger } from '@/lib/logger'
import { signUpSchema, type SignUpInput } from '@/lib/validations'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { sanitizeErrorForClient } from '@/lib/sanitize'
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit'

/**
 * Sign up a new user with rate limiting
 * @param data - User registration data
 * @returns Success status and user data
 */
export async function signUp(data: SignUpInput) {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(data)

    // Rate limit by email to prevent spam registrations
    const rateLimitResult = await checkRateLimit(validatedData.email, authRateLimit)

    if (!rateLimitResult.success) {
      logger.warn('Sign up rate limit exceeded', {
        email: validatedData.email,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset * 1000).toISOString(),
      })

      return {
        success: false,
        error: `Too many registration attempts. Please try again in ${Math.ceil(
          (rateLimitResult.reset * 1000 - Date.now()) / 60000
        )} minutes.`,
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      }
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

    return {
      success: true,
      user,
      message: 'Account created successfully',
    }
  } catch (error) {
    logger.serverActionError('signUp', error)

    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Sign in a user using NextAuth with rate limiting
 * @param email - User email
 * @param password - User password
 * @returns Success status and redirect URL
 */
export async function signInAction(email: string, password: string) {
  try {
    // Rate limit by email to prevent brute force attacks
    const rateLimitResult = await checkRateLimit(email, authRateLimit)

    if (!rateLimitResult.success) {
      logger.warn('Sign in rate limit exceeded', {
        email,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset * 1000).toISOString(),
      })

      return {
        success: false,
        error: `Too many sign in attempts. Please try again in ${Math.ceil(
          (rateLimitResult.reset * 1000 - Date.now()) / 60000
        )} minutes.`,
      }
    }

    logger.auth('Attempting sign in for:', { email })

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    logger.auth('Sign in result:', { result })

    return {
      success: true,
      message: 'Signed in successfully',
    }
  } catch (error) {
    logger.serverActionError('signInAction', error)

    if (error instanceof AuthError) {
      logger.auth('AuthError type:', { type: error.type })
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: 'Invalid email or password',
          }
        case 'CallbackRouteError':
          return {
            success: false,
            error: 'Authentication callback failed. Please check your credentials.',
          }
        default:
          return {
            success: false,
            error: `Authentication failed: ${error.type}`,
          }
      }
    }

    return {
      success: false,
      error: sanitizeErrorForClient(error),
    }
  }
}

/**
 * Reset password (Mock implementation)
 * @param email - User email
 * @returns Success status
 */
export async function resetPassword(email: string) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // TODO: Integrate Resend here
    // See TODO_RESEND_MIGRATION.md

    return {
      success: true,
      message: 'Reset link sent successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send reset link',
    }
  }
}
