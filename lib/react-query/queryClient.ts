/**
 * React Query Configuration
 *
 * Centralized configuration for React Query (TanStack Query).
 * Provides query client with sensible defaults for the application.
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Create a new QueryClient instance with default configuration
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Queries are considered stale after 5 minutes
        staleTime: 5 * 60 * 1000,

        // Cache data for 10 minutes
        gcTime: 10 * 60 * 1000,

        // Retry failed queries 3 times with exponential backoff
        retry: 3,

        // Don't refetch on window focus in development (annoying during dev)
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',

        // Don't refetch on mount if data is fresh
        refetchOnMount: false,

        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  })
}

/**
 * Singleton query client for use in app
 * Create new instance for each request in server components
 */
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  // Server: always create a new query client
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }

  // Browser: reuse existing query client (singleton)
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }

  return browserQueryClient
}
