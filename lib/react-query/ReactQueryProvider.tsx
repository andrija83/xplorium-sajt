'use client'

/**
 * React Query Provider
 *
 * Client-side provider component that wraps the app with React Query context.
 * Ensures singleton pattern for browser and new instance for each SSR request.
 */

import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from './queryClient'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Get or create query client (singleton in browser, new for each SSR request)
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
