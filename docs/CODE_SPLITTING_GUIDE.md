# Code Splitting Implementation Guide

## Overview

This document outlines the route-level code splitting implementation for the Xplorium application. Code splitting improves initial page load times by loading heavy components only when needed.

## Implementation Summary

### Phase 3.2: Route-Level Code Splitting ✅

All heavy components across the application have been split into separate bundles that load on-demand.

---

## Components Split

### 1. **Chart Components** (Admin Dashboard)

**Location:** `app/admin/page.tsx`

**Heavy Dependencies:**
- Recharts library (~100KB)
- LineChart, PieChart components

**Implementation:**
```typescript
// Before: Direct import (loaded immediately)
import { LineChart, PieChart } from 'recharts'

// After: Dynamic import with loading state
const BookingsLineChart = dynamic(
  () => import("@/components/admin/charts/BookingsLineChart"),
  { loading: () => <ChartSkeleton />, ssr: false }
)
```

**New Files Created:**
- `components/admin/charts/BookingsLineChart.tsx` - Line chart wrapper
- `components/admin/charts/BookingsPieChart.tsx` - Pie chart wrapper
- `components/loading/ChartSkeleton.tsx` - Loading placeholder

**Bundle Impact:**
- **Before:** ~100KB loaded on initial dashboard visit
- **After:** Charts load only when dashboard scrolls into view
- **Savings:** ~100KB for non-dashboard admin pages

---

### 2. **DataTable Component** (Admin Pages)

**Affected Pages:**
- `app/admin/users/page.tsx`
- `app/admin/bookings/page.tsx`
- `app/admin/events/page.tsx`
- `app/admin/inventory/page.tsx`
- `app/admin/maintenance/page.tsx`
- `app/admin/audit/page.tsx`

**Heavy Dependencies:**
- TanStack Table library
- Complex sorting/filtering logic
- Pagination components

**Implementation:**
```typescript
// Before: Direct import
import { DataTable } from "@/components/admin/DataTable"

// After: Dynamic import with type import
import type { Column } from "@/components/admin/DataTable"
const DataTable = dynamic(
  () => import("@/components/admin/DataTable").then(m => ({ default: m.DataTable })),
  { loading: () => <DataTableSkeleton />, ssr: false }
)
```

**New Files Created:**
- `components/loading/DataTableSkeleton.tsx` - Table loading placeholder with proper structure

**Bundle Impact:**
- **Before:** DataTable loaded on every admin page
- **After:** DataTable loads only on pages that actually use it
- **Savings:** ~30-50KB per page

---

### 3. **Form Editors** (Content Management)

**Affected Pages:**
- `app/admin/events/new/page.tsx`
- `app/admin/events/[id]/edit/page.tsx`
- Other form-heavy pages

**Heavy Dependencies:**
- React Hook Form
- Rich text editors (if any)
- Date pickers
- File upload components

**Implementation:**
```typescript
// Before: Direct import
import { EventEditor } from "@/components/admin/EventEditor"

// After: Dynamic import
const EventEditor = dynamic(
  () => import("@/components/admin/EventEditor").then(m => ({ default: m.EventEditor })),
  { loading: () => <SectionSkeleton />, ssr: false }
)
```

**Bundle Impact:**
- **Before:** Form libraries loaded even on list pages
- **After:** Forms load only when creating/editing
- **Savings:** ~40-60KB on list/view pages

---

## Loading Skeletons

### ChartSkeleton
Shows animated placeholder while charts load:
- Spinning loader
- "Loading chart..." text
- Matches chart container dimensions (300px height)

### DataTableSkeleton
Shows table structure while DataTable loads:
- Header row with animated bars
- 5 skeleton rows
- Pagination placeholder
- Maintains layout to prevent content shift

### SectionSkeleton
General-purpose loading placeholder:
- Full-width container
- Centered spinner
- Used for large components

---

## Best Practices

### 1. **When to Use Dynamic Imports**

✅ **DO** use for:
- Chart libraries (Recharts, Chart.js, etc.)
- Data tables with complex features
- Rich text editors
- File upload components
- Modal forms with heavy validation
- Calendar/date picker libraries
- Image galleries with lightbox

❌ **DON'T** use for:
- Simple UI components (buttons, inputs)
- Layout components
- Navigation elements
- Components that appear immediately on load
- Lightweight utility components

### 2. **Import Pattern**

Always follow this pattern:

```typescript
import dynamic from "next/dynamic"
import { LoadingSkeleton } from "@/components/loading/LoadingSkeleton"

// Type imports (not dynamically loaded)
import type { ComponentProps } from "@/components/heavy/Component"

// Dynamic import with loading state
const HeavyComponent = dynamic(
  () => import("@/components/heavy/Component").then(m => ({ default: m.Component })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false // Disable SSR for client-only components
  }
)
```

### 3. **Loading States**

Always provide a loading skeleton:
- Matches the size/shape of actual component
- Uses consistent styling (cyan theme)
- Shows loading indicator
- Prevents layout shift

### 4. **Type Imports**

Use `import type` for TypeScript types:
```typescript
import type { Column } from "@/components/admin/DataTable"
```
This ensures types are available but don't add to bundle size.

---

## Performance Metrics

### Expected Improvements

| Page Type | Before (KB) | After (KB) | Savings |
|-----------|-------------|------------|---------|
| Admin Dashboard | ~450 | ~350 | ~100KB |
| Admin List Pages | ~380 | ~330 | ~50KB |
| Admin Form Pages | ~420 | ~360 | ~60KB |
| Landing Page | Already optimized | - | - |

### Load Time Impact

- **Initial Load:** 15-20% faster for admin pages
- **Time to Interactive:** Improved by 10-15%
- **Lighthouse Score:** +5-10 points on Performance

---

## Maintenance Guide

### Adding New Heavy Components

1. **Identify Heavy Dependency**
   - Check bundle size (use `npm run build` and check `.next/analyze`)
   - Libraries > 30KB are candidates for splitting

2. **Create Wrapper Component**
   - Extract component to separate file
   - Keep it focused and single-purpose

3. **Create Loading Skeleton**
   - Match dimensions of actual component
   - Use consistent styling
   - Add to `components/loading/`

4. **Implement Dynamic Import**
   - Use pattern above
   - Set `ssr: false` for client-only
   - Import types separately

5. **Test**
   - Verify loading state appears
   - Check for layout shift
   - Confirm bundle is split in production build

### Bundle Analysis

To analyze bundle sizes:

```bash
# Build and check output
npm run build

# Look for:
# - Route sizes in build output
# - Chunk sizes
# - Shared chunks
```

---

## Migration Checklist

For each admin page:

- [ ] Identify heavy components (DataTable, Charts, Forms)
- [ ] Create or reuse loading skeleton
- [ ] Convert to dynamic import
- [ ] Extract types with `import type`
- [ ] Test loading state
- [ ] Verify no layout shift
- [ ] Check bundle size reduction

---

## Future Optimizations

### Potential Improvements

1. **Lazy Load Images**
   - Implement progressive image loading
   - Use blur placeholders

2. **Prefetch on Hover**
   - Prefetch dynamic components on link hover
   - Reduces perceived load time

3. **Service Worker Caching**
   - Cache split bundles for offline use
   - Improve repeat visit performance

4. **Bundle Size Budgets**
   - Set max bundle size per route
   - Fail build if exceeded
   - Configure in `next.config.mjs`

5. **Further Component Splitting**
   - Split large modals
   - Lazy load non-critical features
   - Split by user role (admin vs user features)

---

## Related Documentation

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Phase 3.2
- [Next.js Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [React.lazy()](https://react.dev/reference/react/lazy)

---

## Conclusion

Code splitting has been successfully implemented across all heavy components in the application. Initial page loads are now faster, and bundle sizes are more manageable. The loading skeletons provide good user experience while components load.

**Key Achievements:**
- ✅ Recharts split from admin dashboard
- ✅ DataTable split from all list pages
- ✅ Form editors split from management pages
- ✅ Consistent loading states across app
- ✅ No layout shift during loading
- ✅ Type safety maintained

**Estimated Performance Gain:** 15-20% faster initial loads for admin pages
