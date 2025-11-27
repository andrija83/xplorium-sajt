# 🚀 XPLORIUM IMPLEMENTATION ROADMAP

**Last Updated:** 2025-01-27
**Status:** Ready for Implementation
**Priority System:** P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Long-term)

---

## 📊 QUICK STATS FROM REVIEWS

| Area | Score | Critical Issues | Top Priority |
|------|-------|----------------|--------------|
| **Backend** | 7.5/10 | 6 critical | Rate limiting, Input sanitization |
| **Database** | 8/10 | 9 critical | Time storage, Price type, Indexes |
| **Frontend** | 7/10 | 11 critical | God components, Code duplication |

**Estimated Total Effort:** 8-10 weeks (1 full-time developer)

---

## 🎯 PHASE 0: CRITICAL SECURITY FIXES (Week 1)

**Timeline:** 3-5 days
**Priority:** P0 - MUST DO IMMEDIATELY
**Risk Level:** HIGH - Security vulnerabilities

### Backend Security (2 days)

- [ ] **Remove test endpoints from production** ⏱️ 10 mins
  - Delete `app/api/test-db/route.ts`
  - Delete `app/api/test-env/route.ts`
  - Files: 2
  - Complexity: Low

- [ ] **Fix weak password generation** ⏱️ 20 mins
  - Update `lib/password.ts` to use `crypto.randomBytes()`
  - Replace `Math.random()` with cryptographically secure alternative
  - Files: 1
  - Complexity: Low
  ```typescript
  // lib/password.ts
  import { randomBytes } from 'crypto'

  export function generatePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    const bytes = randomBytes(length)
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length]
    }
    return password
  }
  ```

- [ ] **Fix PII exposure in public endpoint** ⏱️ 15 mins
  - Update `app/actions/bookings.ts:403-435` (getApprovedBookings)
  - Remove `email` and `phone` from public select
  - Files: 1
  - Complexity: Low

- [ ] **Add rate limiting to auth endpoints** ⏱️ 3 hours
  - Install: `npm install @upstash/ratelimit @upstash/redis`
  - Create `lib/rate-limit.ts`
  - Add rate limiting to `signInAction`, `signUp`, `resetPassword`
  - Files: 2 new, 1 modified
  - Complexity: Medium
  - Setup Upstash Redis account (free tier)

### Database Security (1 day)

- [ ] **Add CHECK constraints for data validation** ⏱️ 2 hours
  - Booking.guestCount > 0 AND <= 1000
  - InventoryItem.quantity >= 0
  - User.loyaltyPoints >= 0
  - User.totalSpent >= 0
  - Create migration file
  - Files: 1 migration
  - Complexity: Low

- [ ] **Add email format validation** ⏱️ 1 hour
  - CHECK constraint for User.email
  - CHECK constraint for Booking.email
  - Files: 1 migration
  - Complexity: Low

### Frontend Security (1 day)

- [ ] **Add error boundaries** ⏱️ 30 mins
  - Wrap app in `<ErrorBoundary>` in `app/layout.tsx`
  - ErrorBoundary already exists at `components/ErrorBoundary.tsx`
  - Files: 1 modified
  - Complexity: Low

- [ ] **Fix useEffect dependency arrays** ⏱️ 2 hours
  - Fix `features/cafe/CafeSection.tsx:111-164`
  - Add cleanup functions for race conditions
  - Test all data fetching flows
  - Files: 3 (CafeSection, SensorySection, IgraonicaSection)
  - Complexity: Medium

**Phase 0 Deliverables:**
- ✅ No security vulnerabilities
- ✅ Rate limiting on auth (5 attempts per 15 minutes)
- ✅ Cryptographically secure password generation
- ✅ Database-level validation
- ✅ No PII leaks in public APIs

---

## 🏗️ PHASE 1: FOUNDATION IMPROVEMENTS (Week 2-3)

**Timeline:** 2 weeks
**Priority:** P1 - High Impact
**Risk Level:** MEDIUM - Architectural changes

### Backend Improvements (1 week)

- [ ] **Standardize error responses** ⏱️ 4 hours
  - Create `lib/errors/api-error.ts` (custom error classes)
  - Create `lib/utils/error-handler.ts` (handleServerError function)
  - Update all server actions to use standardized errors
  - Define `StandardResponse<T>` type
  - Files: 2 new, ~14 modified (all server actions)
  - Complexity: Medium

- [ ] **Add input sanitization** ⏱️ 3 hours
  - Install: `npm install isomorphic-dompurify`
  - Create `lib/utils/sanitize.ts`
  - Add sanitization to createEvent, createBooking, etc.
  - Files: 1 new, ~6 modified
  - Complexity: Low

- [ ] **Fix transaction boundaries** ⏱️ 2 hours
  - Wrap `updateLoyaltyPoints` in `$transaction`
  - Files: 1 modified (`app/actions/customers.ts`)
  - Complexity: Low

- [ ] **Optimize N+1 queries** ⏱️ 6 hours
  - Refactor `syncCustomerData()` to use batch upsert
  - Use Prisma transactions
  - Test with 1000+ test customers
  - Files: 1 modified
  - Complexity: High

- [ ] **Add health check endpoint** ⏱️ 1 hour
  - Create `app/api/health/route.ts`
  - Simple DB connection test
  - Files: 1 new
  - Complexity: Low

- [ ] **Extract constants from magic numbers** ⏱️ 2 hours
  - Create `lib/constants/auth.ts`
  - Move session durations, timeouts, bcrypt rounds
  - Update all references
  - Files: 1 new, ~3 modified
  - Complexity: Low

### Database Improvements (1 week)

- [ ] **Fix time storage (CRITICAL)** ⏱️ 4 hours
  - Add `scheduledAt TIMESTAMPTZ` column to Booking
  - Backfill data: `scheduledAt = date + time`
  - Create indexes on scheduledAt
  - Drop old date/time columns
  - Files: 3-4 migrations (add, backfill, make NOT NULL, drop old)
  - Complexity: High
  - **RISK:** Data migration - test thoroughly!

- [ ] **Fix price storage** ⏱️ 3 hours
  - Add `priceAmount DECIMAL(10,2)` and `priceCurrency VARCHAR(3)`
  - Extract numeric values from existing price strings
  - Drop old price column
  - Files: 2-3 migrations
  - Complexity: Medium

- [ ] **Add missing composite indexes** ⏱️ 1 hour
  - `Booking(status, date)` - for admin dashboard
  - `Booking(userId, date)` - for user history
  - `Booking(date, status)` - for calendar view
  - `AuditLog(action)` - for filtering
  - Files: 1 migration
  - Complexity: Low
  - Use `CREATE INDEX CONCURRENTLY` for zero downtime

- [ ] **Add soft delete pattern** ⏱️ 3 hours
  - Add `deletedAt` and `deletedBy` to Booking, Event, User, InventoryItem
  - Add partial indexes: `WHERE deletedAt IS NULL`
  - Files: 1 migration
  - Complexity: Medium

- [ ] **Add pricing relationship** ⏱️ 3 hours
  - Add `pricingPackageId` FK to Booking
  - Add `pricePaidAmount` and `pricePaidCurrency` for historical snapshot
  - Create indexes
  - Files: 1 migration, 2 modified (Prisma schema, server actions)
  - Complexity: Medium

### Frontend Foundation (1 week)

- [ ] **Install React Query** ⏱️ 3 hours
  - `npm install @tanstack/react-query @tanstack/react-query-devtools`
  - Create `lib/react-query/queryClient.ts`
  - Wrap app in `<QueryClientProvider>`
  - Add devtools in development
  - Files: 2 new, 1 modified
  - Complexity: Low

- [ ] **Create data fetching hooks** ⏱️ 4 hours
  - Create `hooks/queries/useBookings.ts`
  - Create `hooks/queries/useEvents.ts`
  - Create `hooks/queries/usePricingPackages.ts`
  - Replace useEffect data fetching in CafeSection
  - Files: 3 new, 1 modified
  - Complexity: Medium

- [ ] **Add lazy loading** ⏱️ 2 hours
  - Lazy load CafeSection, SensorySection, IgraonicaSection
  - Add `<Suspense>` with loading fallback
  - Files: 2 modified
  - Complexity: Low

- [ ] **Add loading states** ⏱️ 2 hours
  - Create `components/feedback/LoadingState.tsx`
  - Add to pricing sections, events sections
  - Files: 1 new, 3 modified
  - Complexity: Low

**Phase 1 Deliverables:**
- ✅ Standardized error handling across backend
- ✅ Database schema optimizations (time, price, indexes)
- ✅ React Query integrated for data fetching
- ✅ Lazy loading implemented
- ✅ Soft delete pattern in place

---

## 🎨 PHASE 2: CODE QUALITY & REFACTORING (Week 4-5)

**Timeline:** 2 weeks
**Priority:** P1 - Maintainability
**Risk Level:** MEDIUM - Refactoring existing code

### Frontend Refactoring - CRITICAL (1.5 weeks)

**Goal:** Break up God component (1,160 lines → ~200 lines per file)

- [ ] **Extract PricingCard component** ⏱️ 4 hours
  - Create `components/pricing/PricingCard.tsx` (~100 lines)
  - Create `components/pricing/PricingCategory.tsx` (~80 lines)
  - Create `components/pricing/PricingGrid.tsx`
  - **Impact:** Eliminates 1,800 lines of duplication!
  - Files: 3 new, 1 modified
  - Complexity: High
  - **TEST THOROUGHLY** - this is critical UI

- [ ] **Extract CafeSection subsections** ⏱️ 8 hours
  - Create `features/cafe/sections/MenuSection.tsx` (~100 lines)
  - Create `features/cafe/sections/EventsSection.tsx` (~150 lines)
  - Create `features/cafe/sections/HoursSection.tsx` (~80 lines)
  - Create `features/cafe/sections/ContactSection.tsx` (~100 lines)
  - Create `features/cafe/sections/BookingSection.tsx` (~200 lines)
  - Create `features/cafe/sections/PricingSection.tsx` (~150 lines)
  - Update `CafeSection.tsx` to be orchestrator (~100 lines)
  - **Result:** 1,160 lines → ~880 lines total (7 files)
  - Files: 6 new, 1 modified
  - Complexity: High

- [ ] **Create consistent design system** ⏱️ 6 hours
  - Create `components/feedback/ErrorState.tsx`
  - Create `components/feedback/EmptyState.tsx`
  - Create `components/layout/GlassFrame.tsx`
  - Create `components/layout/ScrollableContent.tsx`
  - Update all components to use design system
  - Files: 4 new, ~10 modified
  - Complexity: Medium

### State Management (0.5 weeks)

- [ ] **Install Zustand** ⏱️ 1 hour
  - `npm install zustand`
  - Files: 0
  - Complexity: Low

- [ ] **Create navigation store** ⏱️ 3 hours
  - Create `stores/navigationStore.ts`
  - Replace prop drilling in landing page
  - Remove props from SectionManager, CafeSection, etc.
  - Files: 1 new, ~5 modified
  - Complexity: Medium

- [ ] **Create UI store** ⏱️ 2 hours
  - Create `stores/uiStore.ts`
  - Move modal states, loading states
  - Files: 1 new, ~3 modified
  - Complexity: Low

### Backend Refactoring (1 week)

- [ ] **Add pagination metadata** ⏱️ 3 hours
  - Create `PaginatedResponse<T>` type
  - Update getBookings, getUsers, getEvents
  - Include: total, page, limit, totalPages, hasMore
  - Files: ~6 modified
  - Complexity: Low

- [ ] **Add caching for public endpoints** ⏱️ 4 hours
  - Use `unstable_cache` for getPublishedEvents
  - Cache pricing packages (1 hour TTL)
  - Cache site content (15 min TTL)
  - Files: ~3 modified
  - Complexity: Medium

**Phase 2 Deliverables:**
- ✅ CafeSection.tsx broken into 7 manageable files
- ✅ 1,800 lines of duplication eliminated
- ✅ Zustand for global state management
- ✅ Consistent design system components
- ✅ Pagination implemented

---

## 🚀 PHASE 3: PERFORMANCE & OPTIMIZATION (Week 6-7)

**Timeline:** 2 weeks
**Priority:** P2 - Performance
**Risk Level:** LOW - Optimizations

### Database Performance (1 week)

- [ ] **Add text search indexes** ⏱️ 2 hours
  - Enable pg_trgm extension
  - Add trigram indexes for email, title, phone search
  - Files: 1 migration
  - Complexity: Medium

- [ ] **Add partial indexes** ⏱️ 1 hour
  - Index active records only: `WHERE deletedAt IS NULL`
  - Smaller, faster indexes
  - Files: 1 migration
  - Complexity: Low

- [ ] **Partition AuditLog table** ⏱️ 1 day
  - Create partitioned table by month
  - Migrate existing data
  - Set up automatic partition creation
  - Files: 2 migrations, 1 script
  - Complexity: High
  - **RISK:** Large data migration

- [ ] **Add GDPR compliance fields** ⏱️ 2 hours
  - Add consentGivenAt, consentVersion, deletionRequestedAt to User
  - Files: 1 migration
  - Complexity: Low

### Frontend Performance (1 week)

- [ ] **Add React.memo to components** ⏱️ 4 hours
  - Wrap all pure components
  - Add useMemo for expensive calculations
  - Add useCallback for event handlers
  - Files: ~15 modified
  - Complexity: Low

- [ ] **Optimize Framer Motion** ⏱️ 3 hours
  - Use transform instead of layout properties
  - Set `viewport={{ once: true }}`
  - Reduce animation complexity on mobile
  - Files: ~5 modified
  - Complexity: Medium

- [ ] **Add image optimization** ⏱️ 4 hours
  - Replace `<img>` with Next.js `<Image>`
  - Add blur placeholders
  - Set up Vercel Image Optimization
  - Files: ~10 modified
  - Complexity: Medium

- [ ] **Reduce Starfield particle count** ⏱️ 1 hour
  - Further optimize for mobile
  - Pause when not visible
  - Files: 1 modified
  - Complexity: Low

**Phase 3 Deliverables:**
- ✅ 70%+ performance improvement on Lighthouse
- ✅ Text search 10x faster
- ✅ Images optimized with blur placeholders
- ✅ Animations smooth on mobile (60fps)

---

## 🏢 PHASE 4: PRODUCTION READINESS (Week 8-9)

**Timeline:** 2 weeks
**Priority:** P2 - Production
**Risk Level:** LOW - Infrastructure

### Monitoring & Observability (1 week)

- [ ] **Install Sentry** ⏱️ 2 hours
  - `npm install @sentry/nextjs`
  - Configure error tracking
  - Add source maps upload
  - Files: 2 new config files
  - Complexity: Low

- [ ] **Add Vercel Analytics** ⏱️ 1 hour
  - `npm install @vercel/analytics @vercel/speed-insights`
  - Track Core Web Vitals
  - Files: 1 modified
  - Complexity: Low

- [ ] **Set up database monitoring** ⏱️ 2 hours
  - Enable pg_stat_statements
  - Monitor slow queries
  - Set up Neon metrics dashboard
  - Complexity: Low

- [ ] **Create admin logging dashboard** ⏱️ 1 day
  - View audit logs
  - View error logs
  - View performance metrics
  - Files: 1 new page
  - Complexity: Medium

### Testing Infrastructure (1 week)

- [ ] **Set up Vitest** ⏱️ 3 hours
  - Already installed ✅
  - Configure for backend utils
  - Add test scripts to package.json
  - Files: 1 config modified
  - Complexity: Low

- [ ] **Write critical unit tests** ⏱️ 1 week
  - Test all custom hooks (useLandingAnimation, useNavigationState)
  - Test PricingCard component
  - Test error handling utilities
  - Test validation schemas
  - Files: ~10 new test files
  - Complexity: Medium
  - Target: 60%+ coverage

- [ ] **E2E tests for critical flows** ⏱️ 1 week
  - Playwright already set up ✅
  - Test booking flow
  - Test auth flow
  - Test admin CRUD
  - Files: ~5 new test files
  - Complexity: Medium

**Phase 4 Deliverables:**
- ✅ Sentry error tracking
- ✅ Performance monitoring
- ✅ 60%+ test coverage
- ✅ E2E tests for critical flows

---

## 🌟 PHASE 5: ADVANCED FEATURES (Week 10+)

**Timeline:** Ongoing
**Priority:** P3 - Nice to Have
**Risk Level:** LOW - Future enhancements

### Database Enhancements

- [ ] **Set up read replicas** ⏱️ 1 day
  - Configure Neon read replica
  - Create prismaReadReplica client
  - Route read queries to replica
  - Complexity: Medium

- [ ] **Implement database triggers** ⏱️ 3 days
  - Auto-calculate loyalty tier on points update
  - Auto-update customer stats on booking
  - Complexity: High

### Frontend Enhancements

- [ ] **Storybook for component library** ⏱️ 2 weeks
  - `npx storybook@latest init`
  - Document all reusable components
  - Add interaction tests
  - Complexity: Medium

- [ ] **PWA capabilities** ⏱️ 2 weeks
  - Service worker setup
  - Offline support
  - Install prompt
  - Push notifications
  - Complexity: High

- [ ] **Accessibility audit** ⏱️ 1 week
  - Run axe DevTools
  - Add ARIA live regions
  - Screen reader testing
  - Color contrast fixes
  - Complexity: Medium

### Backend Enhancements

- [ ] **Implement service layer** ⏱️ 2 weeks
  - Extract business logic from server actions
  - Create BookingService, UserService, etc.
  - Complexity: High

- [ ] **Implement repository pattern** ⏱️ 1.5 weeks
  - Abstract Prisma calls
  - Enable easier testing with mocks
  - Complexity: Medium

---

## 📋 IMPLEMENTATION CHECKLIST

### Before Starting Any Phase

- [ ] Create feature branch: `git checkout -b feature/phase-N-description`
- [ ] Review all files to be modified
- [ ] Backup database if making schema changes
- [ ] Inform team about upcoming changes

### During Implementation

- [ ] Write code following TypeScript/React best practices
- [ ] Test locally before committing
- [ ] Write tests if Phase 4+
- [ ] Update documentation if needed
- [ ] Check no console.log() statements (use logger)

### Before Merging

- [ ] Run linter: `npm run lint`
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Run tests: `npm test`
- [ ] Test in production-like environment
- [ ] Create PR with detailed description
- [ ] Get code review (if team member available)

### After Merging

- [ ] Monitor Sentry for errors (Phase 4+)
- [ ] Check performance metrics
- [ ] Update this TODO with completion date
- [ ] Move to next task

---

## 🎯 SUCCESS CRITERIA

### Phase 0 Complete When:
- ✅ All security vulnerabilities fixed
- ✅ Rate limiting working (test with 6 rapid login attempts)
- ✅ No PII in public API responses
- ✅ Database constraints prevent invalid data

### Phase 1 Complete When:
- ✅ All errors use standardized format
- ✅ Database uses proper types (TIMESTAMPTZ, DECIMAL)
- ✅ React Query working for all data fetching
- ✅ Lazy loading reduces initial bundle by 30%+

### Phase 2 Complete When:
- ✅ CafeSection.tsx < 200 lines
- ✅ No code duplication in pricing cards
- ✅ Zustand managing all global state
- ✅ Consistent design system used everywhere

### Phase 3 Complete When:
- ✅ Lighthouse Performance score > 90
- ✅ All images use next/image
- ✅ Animations smooth on mobile (60fps)
- ✅ Search queries < 100ms

### Phase 4 Complete When:
- ✅ Sentry catching all errors
- ✅ Test coverage > 60%
- ✅ E2E tests pass for critical flows
- ✅ Performance monitoring active

---

## 📞 SUPPORT & RESOURCES

### Documentation
- Backend Review: `docs/BACKEND_REVIEW_2025.md`
- Database Review: `docs/DATABASE_REVIEW_2025.md`
- Frontend Review: `docs/FRONTEND_REVIEW_2025.md`

### External Resources
- React Query Docs: https://tanstack.com/query/latest
- Zustand Docs: https://zustand-demo.pmnd.rs/
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

### Tools
- Upstash (Rate Limiting): https://upstash.com/
- Sentry (Error Tracking): https://sentry.io/
- Vercel Analytics: https://vercel.com/analytics

---

## 🏁 NOTES

- **Estimated Timeline:** 8-10 weeks for Phases 0-4
- **Recommended Approach:** Complete phases sequentially
- **Can work in parallel:** Backend + Database tasks can run alongside Frontend tasks
- **Testing:** Critical after Phase 2 refactoring
- **Deployment:** Deploy after each phase completes
- **Rollback Plan:** Keep feature flags for major changes

**Last Updated:** 2025-01-27
**Next Review:** After Phase 2 completion
