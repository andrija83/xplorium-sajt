/**
 * API Response Types
 *
 * Standardized response types for server actions and API routes.
 * Import these types for type-safe API responses.
 */

import type { ErrorType } from '@/lib/errors/api-error'

/**
 * Standard success response
 */
export type ApiSuccessResponse<T = unknown> = {
  success: true
  data: T
  message?: string
}

/**
 * Standard error response
 */
export type ApiErrorResponse = {
  success: false
  error: string
  errorType?: ErrorType
  details?: Record<string, unknown>
}

/**
 * Standard API response (success or error)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Pagination metadata
 */
export type PaginationMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Paginated response wrapper
 */
export type PaginatedResponse<T> = ApiSuccessResponse<{
  items: T[]
  pagination: PaginationMeta
}>

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false
}
