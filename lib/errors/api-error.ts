/**
 * Custom API Error Classes
 *
 * Provides typed error classes for consistent error handling across the application.
 * Each error class includes appropriate HTTP status codes and error types.
 */

/**
 * Error types for categorization
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}

/**
 * Base API Error class
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly errorType: ErrorType
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number,
    errorType: ErrorType,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.errorType = errorType
    this.details = details

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation Error (400)
 * Used when input validation fails
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, ErrorType.VALIDATION, details)
  }
}

/**
 * Authentication Error (401)
 * Used when user is not authenticated
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, ErrorType.AUTHENTICATION)
  }
}

/**
 * Authorization Error (403)
 * Used when user lacks required permissions
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, ErrorType.AUTHORIZATION)
  }
}

/**
 * Not Found Error (404)
 * Used when a resource is not found
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, ErrorType.NOT_FOUND)
  }
}

/**
 * Conflict Error (409)
 * Used when there's a conflict (e.g., duplicate email)
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, ErrorType.CONFLICT, details)
  }
}

/**
 * Rate Limit Error (429)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter: number

  constructor(retryAfter: number) {
    super(
      `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      429,
      ErrorType.RATE_LIMIT,
      { retryAfter }
    )
    this.retryAfter = retryAfter
  }
}

/**
 * Database Error (500)
 * Used when database operations fail
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', details?: Record<string, unknown>) {
    super(message, 500, ErrorType.DATABASE, details)
  }
}

/**
 * Internal Server Error (500)
 * Used for unexpected errors
 */
export class InternalError extends ApiError {
  constructor(message: string = 'An unexpected error occurred', details?: Record<string, unknown>) {
    super(message, 500, ErrorType.INTERNAL, details)
  }
}
