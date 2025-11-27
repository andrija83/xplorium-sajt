/**
 * usePricingPackages Hook
 *
 * React Query hook for fetching published pricing packages for all categories.
 * Provides automatic caching, loading states, and error handling.
 */

import { useQueries } from '@tanstack/react-query'
import { getPublishedPricingPackages } from '@/app/actions/pricing'
import type { PricingCategory } from '@/components/pricing'

/**
 * Fetch and cache pricing packages for all categories
 *
 * Returns packages organized by category with unified loading/error states
 */
export function usePricingPackages() {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['pricing', 'PLAYGROUND'],
        queryFn: async () => {
          const result = await getPublishedPricingPackages('PLAYGROUND')
          if (!result.success) throw new Error(result.error || 'Failed to fetch playground packages')
          return result.packages || []
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      },
      {
        queryKey: ['pricing', 'SENSORY_ROOM'],
        queryFn: async () => {
          const result = await getPublishedPricingPackages('SENSORY_ROOM')
          if (!result.success) throw new Error(result.error || 'Failed to fetch sensory room packages')
          return result.packages || []
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
      {
        queryKey: ['pricing', 'CAFE'],
        queryFn: async () => {
          const result = await getPublishedPricingPackages('CAFE')
          if (!result.success) throw new Error(result.error || 'Failed to fetch cafe packages')
          return result.packages || []
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
      {
        queryKey: ['pricing', 'PARTY'],
        queryFn: async () => {
          const result = await getPublishedPricingPackages('PARTY')
          if (!result.success) throw new Error(result.error || 'Failed to fetch party packages')
          return result.packages || []
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
    ],
  })

  return {
    data: {
      playground: queries[0].data || [],
      sensory: queries[1].data || [],
      cafe: queries[2].data || [],
      party: queries[3].data || [],
    },
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
    errors: queries.map(q => q.error).filter(Boolean),
    refetch: () => queries.forEach(q => q.refetch()),
  }
}
