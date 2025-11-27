/**
 * Error Handler Utility
 *
 * Provides standardized error handling for server actions and API routes.
 * Converts errors to safe, consistent response formats.
 */

import { ApiError, ErrorType, InternalError } from '@/lib/errors/api-error'
import { logger } from '@/lib/logger'
import { sanitizeErrorForClient } from '@/lib/sanitize'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

/**
 * Standard success response type
 */
export type SuccessResponse<T = unknown> = {
  success: true
  data: T
  message?: string
}

/**
 * Standard error response type
 */
export type ErrorResponse = {
  success: false
  error: string
  errorType?: ErrorType
  details?: Record<string, unknown>
}

/**
 * Standard response type (success or error)
 */
export type StandardResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  }
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string,
  errorType?: ErrorType,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    error,
    ...(errorType && { errorType }),
    ...(details && { details }),
  }
}

/**
 * Handle server action errors with standardized responses
 *
 * @param actionName - Name of the server action (for logging)
 * @param error - The caught error
 * @returns Standardized error response
 */
export function handleServerError(actionName: string, error: unknown): ErrorResponse {
  // Log the error for debugging
  logger.serverActionError(actionName, error)

  // Handle custom ApiError
  if (error instanceof ApiError) {
    return createErrorResponse(
      sanitizeErrorForClient(error),
      error.errorType,
      error.details
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return createErrorResponse(
      'Validation failed',
      ErrorType.VALIDATION,
      { fields: fieldErrors }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return createErrorResponse(
      'Invalid database query',
      ErrorType.DATABASE
    )
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return createErrorResponse(sanitizeErrorForClient(error), ErrorType.INTERNAL)
  }

  // Fallback for unknown errors
  return createErrorResponse(
    'An unexpected error occurred',
    ErrorType.INTERNAL
  )
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): ErrorResponse {
  switch (error.code) {
    case 'P2002': {
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined
      const field = target?.[0] || 'field'
      return createErrorResponse(
        `A record with this ${field} already exists`,
        ErrorType.CONFLICT,
        { field }
      )
    }

    case 'P2025': {
      // Record not found
      return createErrorResponse(
        'Record not found',
        ErrorType.NOT_FOUND
      )
    }

    case 'P2003': {
      // Foreign key constraint violation
      const field = error.meta?.field_name as string | undefined
      return createErrorResponse(
        field ? `Invalid ${field} reference` : 'Invalid reference',
        ErrorType.VALIDATION,
        { field }
      )
    }

    case 'P2011': {
      // Null constraint violation
      const field = error.meta?.target as string | undefined
      return createErrorResponse(
        field ? `${field} is required` : 'Required field is missing',
        ErrorType.VALIDATION,
        { field }
      )
    }

    case 'P2014': {
      // Invalid relation
      return createErrorResponse(
        'Invalid relation between records',
        ErrorType.VALIDATION
      )
    }

    case 'P2023': {
      // Inconsistent column data
      return createErrorResponse(
        'Invalid data format',
        ErrorType.VALIDATION
      )
    }

    default: {
      // Unknown Prisma error
      logger.error('Unhandled Prisma error', error)
      return createErrorResponse(
        'Database operation failed',
        ErrorType.DATABASE,
        { code: error.code }
      )
    }
  }
}

/**
 * Wrap server action in try-catch with standardized error handling
 *
 * @param actionName - Name of the action (for logging)
 * @param fn - The async function to execute
 * @returns Standardized response (success or error)
 */
export async function withErrorHandling<T>(
  actionName: string,
  fn: () => Promise<T>
): Promise<StandardResponse<T>> {
  try {
    const data = await fn()
    return createSuccessResponse(data)
  } catch (error) {
    return handleServerError(actionName, error)
  }
}
