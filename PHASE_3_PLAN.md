# Phase 3: API Optimization & Server-Side Caching - Implementation Plan

**Date:** 2025-12-19
**Status:** In Progress
**Goal:** Reduce API latency from ~822ms avg to ~150ms and eliminate 30s polling

---

## Analysis Summary

### ✅ What's Already Good

**1. Database Indexes** - **EXCELLENT** ✅
- Prisma schema has comprehensive indexing
- All critical queries already indexed:
  - Booking: 15 indexes (single + composite)
  - User: 8 indexes
  - Event: 5 indexes
  - Notification: 5 indexes
  - AuditLog: 6 indexes
- **No additional indexes needed!**

**2. Pagination** - **ALREADY IMPLEMENTED** ✅
- `getBookings()` has limit/offset pagination (default: 50)
- Dashboard queries use `take` limits
- **No changes needed!**

**3. Query Optimization** - **ALREADY OPTIMIZED** ✅
- Dashboard uses Promise.all for parallel queries
- Aggregate queries replace multiple count queries
- GroupBy used for analytics
- **No changes needed!**

### ❌ What Needs Improvement

**1. Server-Side Caching** - **NOT IMPLEMENTED** ❌
- Currently using `revalidatePath` only
- No `unstable_cache` for expensive queries
- Heavy queries run on every request
- **HIGH PRIORITY**

**2. Admin Layout Polling** - **INEFFICIENT** ❌
- 30s polling interval (line 84-85 in app/admin/layout.tsx)
- Fetches full booking list every 30s
- No React Query caching
- **HIGH PRIORITY**

**3. Cache Invalidation** - **PARTIAL** ⚠️
- Using `revalidatePath` but not `revalidateTag`
- No granular cache invalidation
- **MEDIUM PRIORITY**

---

## Implementation Tasks

### Task 1: Add Server-Side Caching with `unstable_cache` 🎯

**Target Functions:**
1. `getDashboardStats()` - Heavy aggregation query
2. `getBookings()` - Frequently accessed
3. `getEvents()` - Frequently accessed
4. `getPricingPackages()` - Rarely changes
5. `getSiteContent()` - Rarely changes

**Pattern to Use:**
```typescript
import { unstable_cache } from 'next/cache'

export const getCachedDashboardStats = unstable_cache(
  async () => {
    // Existing query logic
    return await getDashboardStats()
  },
  ['dashboard-stats'], // Cache key
  {
    revalidate: 300, // 5 minutes
    tags: ['dashboard', 'bookings']
  }
)
```

**Expected Impact:**
- Dashboard load: 822ms → ~50ms (94% reduction)
- Repeat requests: Near-instant from cache
- Server load: 70-80% reduction

---

### Task 2: Replace Polling with React Query 🎯

**Current Issue:**
`app/admin/layout.tsx` lines 84-85:
```typescript
// Refresh count every 30 seconds
const interval = setInterval(fetchPendingCount, 30000)
```

**Solution:**
Use React Query with automatic cache and refetch:
```typescript
import { useQuery } from '@tanstack/react-query'

const { data: pendingCount = 0 } = useQuery({
  queryKey: ['pending-bookings-count'],
  queryFn: async () => {
    const result = await getBookings({ status: 'PENDING' })
    return result.bookings?.length || 0
  },
  refetchInterval: 60000, // 1 minute (instead of 30s)
  staleTime: 30000, // Consider fresh for 30s
  gcTime: 300000 // Keep in cache for 5 minutes
})
```

**Benefits:**
- Automatic caching (no duplicate requests)
- Smarter refetching (only when stale)
- Background updates
- No memory leaks (automatic cleanup)

**Expected Impact:**
- Request frequency: 50% reduction (60s vs 30s)
- Cache hits: 80-90% of navigations
- No redundant requests during rapid navigation

---

### Task 3: Add Cache Invalidation with `revalidateTag` 🎯

**Current Pattern:**
```typescript
// After booking update
revalidatePath('/admin/bookings')
```

**New Pattern:**
```typescript
import { revalidateTag } from 'next/cache'

// After booking update
revalidateTag('bookings')
revalidateTag('dashboard')
```

**Tag Strategy:**
- `bookings` - All booking data
- `events` - All event data
- `users` - User data
- `dashboard` - Dashboard stats
- `pricing` - Pricing packages
- `content` - Site content

**Benefits:**
- Granular cache invalidation
- Multi-level cache updates
- Predictable cache behavior

---

## Implementation Order

### Step 1: Add Caching Infrastructure (30 min)
1. Create `lib/cache.ts` with cache utilities
2. Define cache keys and tags
3. Create wrapper functions

### Step 2: Cache Dashboard Queries (20 min)
1. Add `unstable_cache` to `getDashboardStats()`
2. Add cache tags
3. Test with cache inspector

### Step 3: Cache Frequent Queries (30 min)
1. Add caching to `getBookings()`
2. Add caching to `getEvents()`
3. Add caching to `getPricingPackages()`
4. Add caching to `getSiteContent()`

### Step 4: React Query Setup (20 min)
1. Verify React Query is configured (already done)
2. Replace polling in admin layout
3. Add query keys for pending count

### Step 5: Cache Invalidation (20 min)
1. Replace `revalidatePath` with `revalidateTag` where appropriate
2. Add tag invalidation to all mutations
3. Test cache invalidation flow

### Step 6: Testing & Verification (30 min)
1. Test dashboard load times
2. Test cache hits/misses
3. Test cache invalidation
4. Monitor server load

**Total Estimated Time:** ~2.5 hours

---

## Cache Strategy

### Cache Durations by Data Type

| Data Type | Revalidate | Reasoning |
|-----------|------------|-----------|
| **Dashboard Stats** | 5 min | Aggregated data, can be slightly stale |
| **Bookings List** | 2 min | Moderate updates, need freshness |
| **Events List** | 5 min | Infrequent updates |
| **Pricing** | 1 hour | Rarely changes |
| **Site Content** | 1 hour | Rarely changes |
| **User Count** | 10 min | Slow-changing metric |
| **Pending Count** | 1 min | Needs to be relatively fresh |

### Cache Tags Mapping

```typescript
// lib/cache.ts
export const CACHE_TAGS = {
  BOOKINGS: 'bookings',
  EVENTS: 'events',
  USERS: 'users',
  DASHBOARD: 'dashboard',
  PRICING: 'pricing',
  CONTENT: 'content',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings'
} as const
```

---

## Expected Performance Improvements

### Before Phase 3:
- Dashboard load: ~822ms avg
- Pending count refresh: Every 30s (always fresh fetch)
- Cache strategy: Path-based only
- Server queries: ~100-150/hour (per admin user)

### After Phase 3:
- Dashboard load: ~50ms (from cache) / ~300ms (fresh)
- Pending count refresh: Every 60s (with 30s stale time)
- Cache strategy: Tag-based + time-based
- Server queries: ~20-30/hour (per admin user)

### Performance Gains:
- **Dashboard:** 94% faster (cached) / 64% faster (fresh)
- **API Load:** 70-80% reduction
- **User Experience:** Near-instant navigation
- **Server Cost:** 70-80% reduction in DB queries

---

## Rollback Plan

If caching causes issues:

### Remove Server-Side Caching:
```typescript
// Remove unstable_cache wrapper
// Back to direct queries
export async function getDashboardStats() {
  // Original implementation
}
```

### Restore Polling:
```typescript
// In app/admin/layout.tsx
const interval = setInterval(fetchPendingCount, 30000)
```

### Remove Cache Tags:
```typescript
// Keep only revalidatePath
revalidatePath('/admin/bookings')
```

---

## Files to Modify

### New Files:
1. `lib/cache.ts` - Cache utilities and constants

### Modified Files:
1. `app/actions/dashboard.ts` - Add caching to getDashboardStats()
2. `app/actions/bookings.ts` - Add caching to getBookings()
3. `app/actions/events.ts` - Add caching to getEvents()
4. `app/actions/pricing.ts` - Add caching to getPricingPackages()
5. `app/actions/content.ts` - Add caching to getSiteContent()
6. `app/admin/layout.tsx` - Replace polling with React Query
7. All mutation actions - Add revalidateTag calls

**Estimated:** 7-10 files modified

---

## Success Metrics

- [ ] Dashboard loads in <100ms (cached)
- [ ] Pending count updates without polling every 30s
- [ ] Cache hit rate >80% for repeat requests
- [ ] Server DB queries reduced by 70%+
- [ ] No cache staleness issues
- [ ] Cache invalidation works correctly
- [ ] 0 breaking changes
- [ ] Lighthouse performance score improves

---

## Next Steps

1. Create `lib/cache.ts` with utilities
2. Start with dashboard caching
3. Add React Query to admin layout
4. Expand caching to other queries
5. Add cache invalidation
6. Test thoroughly
7. Create Phase 3 completion report

---

**Ready to begin implementation! 🚀**
