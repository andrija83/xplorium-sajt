/**
 * Server-Side Caching Utilities
 *
 * Centralized cache configuration for Next.js unstable_cache
 * Used in server actions to reduce database load and improve performance
 */

/**
 * Cache Tags
 * Used for granular cache invalidation with revalidateTag()
 */
export const CACHE_TAGS = {
  BOOKINGS: 'bookings',
  EVENTS: 'events',
  USERS: 'users',
  DASHBOARD: 'dashboard',
  PRICING: 'pricing',
  CONTENT: 'content',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  CAMPAIGNS: 'campaigns',
  MAINTENANCE: 'maintenance',
  INVENTORY: 'inventory',
  AUDIT: 'audit'
} as const

/**
 * Cache Keys
 * Unique identifiers for cached data
 */
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard-stats',
  BOOKINGS_LIST: 'bookings-list',
  BOOKINGS_PENDING_COUNT: 'bookings-pending-count',
  EVENTS_LIST: 'events-list',
  EVENTS_UPCOMING: 'events-upcoming',
  PRICING_PACKAGES: 'pricing-packages',
  SITE_CONTENT: 'site-content',
  USER_COUNT: 'user-count',
  SETTINGS_ALL: 'settings-all'
} as const

/**
 * Cache Durations (in seconds)
 * Defines how long cached data remains valid
 */
export const CACHE_DURATION = {
  // Fast-changing data (1-2 minutes)
  BOOKINGS: 120,           // 2 minutes - moderate update frequency
  PENDING_COUNT: 60,       // 1 minute - needs freshness
  NOTIFICATIONS: 120,      // 2 minutes

  // Moderate-changing data (5-10 minutes)
  DASHBOARD: 300,          // 5 minutes - aggregated data
  EVENTS: 300,             // 5 minutes
  USER_COUNT: 600,         // 10 minutes - slow-changing

  // Slow-changing data (30-60 minutes)
  PRICING: 3600,           // 1 hour - rarely changes
  CONTENT: 3600,           // 1 hour - rarely changes
  SETTINGS: 3600,          // 1 hour - rarely changes

  // Very stable data (24 hours)
  STATIC: 86400            // 24 hours - nearly static
} as const

/**
 * Type for cache tag values
 */
export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS]

/**
 * Type for cache key values
 */
export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS]

/**
 * Helper to generate cache keys with parameters
 * @example getCacheKey('bookings-list', { status: 'PENDING' }) => 'bookings-list:status=PENDING'
 */
export function getCacheKey(base: string, params?: Record<string, string | number | undefined>): string {
  if (!params) return base

  const paramStr = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .sort() // Sort for consistent keys
    .join(',')

  return paramStr ? `${base}:${paramStr}` : base
}

/**
 * Cache configuration presets for common patterns
 */
export const CACHE_CONFIG = {
  /**
   * Fast-changing data (bookings, notifications)
   * Revalidate every 2 minutes
   */
  FAST: {
    revalidate: CACHE_DURATION.BOOKINGS,
    tags: [] as CacheTag[]
  },

  /**
   * Moderate-changing data (dashboard, events)
   * Revalidate every 5 minutes
   */
  MODERATE: {
    revalidate: CACHE_DURATION.DASHBOARD,
    tags: [] as CacheTag[]
  },

  /**
   * Slow-changing data (pricing, content)
   * Revalidate every hour
   */
  SLOW: {
    revalidate: CACHE_DURATION.PRICING,
    tags: [] as CacheTag[]
  },

  /**
   * Nearly static data
   * Revalidate every 24 hours
   */
  STATIC: {
    revalidate: CACHE_DURATION.STATIC,
    tags: [] as CacheTag[]
  }
} as const

/**
 * Helper to create cache config with tags
 * @example createCacheConfig('MODERATE', ['dashboard', 'bookings'])
 */
export function createCacheConfig(
  preset: keyof typeof CACHE_CONFIG,
  tags: CacheTag[]
): { revalidate: number; tags: CacheTag[] } {
  return {
    revalidate: CACHE_CONFIG[preset].revalidate,
    tags
  }
}
