'use server'

import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { signUpSchema, type SignUpInput } from '@/lib/validations'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

/**
 * Sign up a new user
 * @param data - User registration data
 * @returns Success status and user data
 */
export async function signUp(data: SignUpInput) {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(data)

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
    console.error('Sign up error:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to create account',
    }
  }
}

/**
 * Sign in a user using NextAuth
 * @param email - User email
 * @param password - User password
 * @returns Success status and redirect URL
 */
export async function signInAction(email: string, password: string) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return {
      success: true,
      message: 'Signed in successfully',
    }
  } catch (error) {
    console.error('Sign in error:', error)

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: 'Invalid email or password',
          }
        default:
          return {
            success: false,
            error: 'Failed to sign in',
          }
      }
    }

    return {
      success: false,
      error: 'Failed to sign in',
    }
  }
}
