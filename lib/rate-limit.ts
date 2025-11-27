/**
 * Rate Limiting Utility using Upstash Redis
 *
 * Provides sliding window rate limiting for authentication endpoints
 * and other sensitive operations to prevent brute force attacks.
 *
 * Setup:
 * 1. Create a free Redis database at https://upstash.com
 * 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from './logger'

// Check if Upstash is configured
const isUpstashConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * In-memory fallback for development/testing when Upstash is not configured
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async limit(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []

    // Filter out requests outside the window
    const recentRequests = requests.filter((timestamp) => timestamp > windowStart)

    // Check if limit exceeded
    const success = recentRequests.length < this.maxRequests

    if (success) {
      // Add current request
      recentRequests.push(now)
      this.requests.set(identifier, recentRequests)
    }

    const remaining = Math.max(0, this.maxRequests - recentRequests.length - 1)
    const reset = Math.floor((now + this.windowMs) / 1000)

    return {
      success,
      limit: this.maxRequests,
      remaining,
      reset,
    }
  }
}

/**
 * Authentication rate limiter
 * Limits: 5 attempts per 15 minutes per IP
 */
export const authRateLimit = isUpstashConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : new InMemoryRateLimiter(5, 15 * 60 * 1000)

/**
 * General API rate limiter
 * Limits: 30 requests per minute per IP
 */
export const apiRateLimit = isUpstashConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : new InMemoryRateLimiter(30, 60 * 1000)

/**
 * Strict rate limiter for sensitive operations
 * Limits: 3 attempts per hour per IP
 */
export const strictRateLimit = isUpstashConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:strict',
    })
  : new InMemoryRateLimiter(3, 60 * 60 * 1000)

/**
 * Helper to get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Check rate limit and return result
 * Returns success: false if rate limit exceeded
 */
export async function checkRateLimit(
  identifier: string,
  limiter: typeof authRateLimit = authRateLimit
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  try {
    const result = await limiter.limit(identifier)

    if (!result.success) {
      logger.warn('Rate limit exceeded', {
        identifier,
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset * 1000).toISOString(),
      })
    }

    return result
  } catch (error) {
    // If rate limiting fails, log error but allow request to proceed
    // (fail open to prevent service disruption)
    logger.error('Rate limit check failed', error instanceof Error ? error : new Error(String(error)))

    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }
}

// Log warning if Upstash is not configured
if (!isUpstashConfigured && process.env.NODE_ENV === 'production') {
  logger.warn(
    'Upstash Redis not configured. Using in-memory rate limiting (not recommended for production).',
    {
      required_env_vars: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    }
  )
}
