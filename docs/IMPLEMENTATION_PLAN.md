# Implementation Plan - Code Review & Architecture Improvements

## Overview
This document outlines the implementation plan to address critical performance, accessibility, architecture, and security issues identified in the code review.

---

## Phase 1: Performance & SSR Optimization (High Priority)

### 1.1 Split Landing Page for SSR/Streaming
**Issue:** `app/page.tsx` is entirely client-side, preventing SSR/streaming and hurting TTFB/SEO.

**Tasks:**
- [ ] Extract server-capable shell components:
  - Static hero section (brand name, logo initial state)
  - SEO metadata (title, description, structured data)
  - Core layout structure
- [ ] Convert client-only sections to dynamic imports:
  ```typescript
  const CafeSection = dynamic(() => import('@/features/cafe/CafeSection'), {
    loading: () => <SectionSkeleton />,
    ssr: false
  })
  ```
- [ ] Keep only interactive parts hydrated (nav buttons, modals, animation triggers)
- [ ] Add loading skeletons for code-split sections
- [ ] Measure improvement: TTFB, FCP, LCP

**Files to modify:**
- `app/page.tsx` - Split into server and client components
- Create `app/page.server.tsx` for SSR shell
- Create `components/loading/SectionSkeleton.tsx`

**Estimated effort:** 2-3 days

---

### 1.2 Optimize Middleware for Public Routes
**Issue:** Auth middleware applies to nearly all routes, blocking static caching on public pages.

**Tasks:**
- [ ] Update `middleware.ts` matcher to only protect admin routes:
  ```typescript
  export const config = {
    matcher: [
      '/admin/:path*',
      '/api/admin/:path*',
      '/profile/:path*'
    ]
  }
  ```
- [ ] Remove auth checks from public landing page
- [ ] Add explicit public route list
- [ ] Test that admin routes still require auth
- [ ] Verify public routes are cached correctly

**Files to modify:**
- `middleware.ts`

**Estimated effort:** 2-4 hours

---

### 1.3 Remove Unused Imports & Dead Code
**Issue:** Unused imports add bundle weight and cause lint errors.

**Tasks:**
- [ ] Remove unused imports from `app/page.tsx`:
  - `ChevronDown`
  - `TypewriterText` (if not used)
  - `PlanetOrb` (if not used)
  - `NEON_COLORS` (if not used)
  - `cafeGalleryImages`
- [ ] Run ESLint to find other unused imports across codebase
- [ ] Remove or wire up commented code
- [ ] Measure bundle size reduction

**Files to audit:**
- `app/page.tsx`
- All feature components

**Estimated effort:** 1 day

---

## Phase 2: Accessibility & Motion Preferences (High Priority)

### 2.1 Comprehensive Reduced Motion Support
**Issue:** `prefers-reduced-motion` only affects particles; heavy animations still run.

**Tasks:**
- [ ] Update all animation sequences to respect motion preference:
  - Logo spin animation
  - Neon glow effects
  - Drip morph animations
  - Section transitions
  - Text reveals
- [ ] Reduce particle counts further on mobile:
  ```typescript
  const particleCount = prefersReducedMotion
    ? 0
    : isMobile
      ? 10
      : 25
  ```
- [ ] Add motion toggle in user settings (optional)
- [ ] Add CSS fallbacks:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

**Files to modify:**
- `app/page.tsx`
- `constants/animations.ts`
- `app/globals.css`
- All animation components in `components/animations/`

**Estimated effort:** 2-3 days

---

### 2.2 Keyboard Navigation & ARIA Labels
**Issue:** Menu relies on click/hover; missing focus order and ARIA labels.

**Tasks:**
- [ ] Add keyboard navigation to section buttons:
  - Tab order through main navigation
  - Enter/Space to activate sections
  - Escape to close sections/modals
- [ ] Add ARIA labels to all interactive elements:
  ```tsx
  <button
    aria-label="Open Cafe section"
    aria-expanded={activeView === 'cafe'}
  >
  ```
- [ ] Add focus indicators (visible focus rings)
- [ ] Add skip-to-content link
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Add focus trap in modals

**Files to modify:**
- `app/page.tsx`
- `components/auth/SignInModal.tsx`
- `components/auth/SignUpModal.tsx`
- All feature section components

**Estimated effort:** 2 days

---

## Phase 3: Architecture Refactoring (Medium Priority)

### 3.1 Break Monolithic Landing Component
**Issue:** Single component handles all state, animation, and navigation logic.

**Tasks:**
- [ ] Extract domain slices:
  1. **Hero Shell** (`components/landing/HeroShell.tsx`)
     - X logo animation
     - Brand reveal
     - Background starfield

  2. **Navigation Layer** (`components/landing/NavigationLayer.tsx`)
     - Main navigation buttons
     - Section state management
     - Keyboard handling

  3. **Section Manager** (`components/landing/SectionManager.tsx`)
     - Section routing logic
     - AnimatePresence wrapper
     - Lazy loading coordinator

  4. **Auth Layer** (`components/landing/AuthLayer.tsx`)
     - Modal state management
     - Auth buttons
     - Sign in/up forms

- [ ] Extract shared animation tokens to `constants/animations.ts`:
  ```typescript
  export const SECTION_TRANSITIONS = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 }
  }
  ```

- [ ] Create custom hooks for shared logic:
  - `useNavigationState()` - Section navigation
  - `useLandingAnimation()` - Animation orchestration
  - `useModalState()` - Modal management

**Files to create:**
- `components/landing/HeroShell.tsx`
- `components/landing/NavigationLayer.tsx`
- `components/landing/SectionManager.tsx`
- `components/landing/AuthLayer.tsx`
- `hooks/useNavigationState.ts`
- `hooks/useLandingAnimation.ts`
- `hooks/useModalState.ts`

**Files to refactor:**
- `app/page.tsx` - Compose new components

**Estimated effort:** 4-5 days

---

### 3.2 Route-Level Code Splitting
**Issue:** No code splitting for non-landing pages.

**Tasks:**
- [ ] Audit all pages for client-only content
- [ ] Implement dynamic imports for heavy components:
  - Admin DataTable components
  - Rich text editors
  - Calendar/date pickers
  - Chart libraries (if any)
- [ ] Add loading states for all dynamic imports
- [ ] Measure bundle size per route
- [ ] Set bundle size budgets

**Files to audit:**
- All pages in `app/admin/`
- All pages in `app/`

**Estimated effort:** 2-3 days

---

## Phase 4: Dependency & Stability (Medium Priority)

### 4.1 Stabilize Dependency Stack
**Issue:** Bleeding-edge dependencies (Next 16, React 19, Tailwind 4 alpha, NextAuth 5 beta).

**Decision Required:** Choose one of the following approaches:

#### Option A: Downgrade to Stable (Recommended for Production)
- [ ] Downgrade to Next.js 14.2.x (stable)
- [ ] Downgrade to React 18.3.x (stable)
- [ ] Downgrade to Tailwind CSS 3.4.x (stable)
- [ ] Downgrade to NextAuth 4.x (stable) or Auth.js 5.x stable
- [ ] Test all features thoroughly
- [ ] Update documentation

**Estimated effort:** 3-4 days + testing

#### Option B: Pin Bleeding-Edge Versions (Current Development)
- [ ] Pin exact versions in `package.json`:
  ```json
  {
    "dependencies": {
      "next": "16.0.0",
      "react": "19.2.0",
      "tailwindcss": "4.0.0-alpha.X",
      "next-auth": "5.0.0-beta.X"
    }
  }
  ```
- [ ] Document known issues and workarounds
- [ ] Set up staging environment for testing
- [ ] Monitor changelogs for breaking changes
- [ ] Plan upgrade path to stable releases

**Estimated effort:** 1 day + ongoing monitoring

**Recommendation:** Option A for production deployment, Option B acceptable for continued development.

---

## Phase 5: Security & Role Enforcement (High Priority)

### 5.1 Comprehensive Server-Side Role Checks
**Issue:** Middleware checks roles, but not consistently enforced server-side in data fetching.

**Tasks:**
- [ ] Audit all server actions for role checks:
  ```typescript
  // ❌ Bad - only middleware check
  export async function getUsers() {
    return await prisma.user.findMany()
  }

  // ✅ Good - server action check
  export async function getUsers() {
    const session = await auth()
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }
    return await prisma.user.findMany()
  }
  ```

- [ ] Create role check utilities:
  ```typescript
  // lib/auth-utils.ts
  export async function requireRole(roles: Role[]) {
    const session = await auth()
    if (!session || !roles.includes(session.user.role)) {
      throw new Error('Unauthorized')
    }
    return session
  }
  ```

- [ ] Apply to all actions:
  - ✅ Audit logs (already done)
  - ✅ Users (already done)
  - ✅ Inventory (already done)
  - ✅ Maintenance (already done)
  - ✅ Bookings (already done)
  - ✅ Events (already done)
  - ✅ Pricing (already done)
  - [ ] Content management
  - [ ] Any other admin actions

**Files to audit:**
- All files in `app/actions/`
- Create `lib/auth-utils.ts`

**Estimated effort:** 1-2 days

---

### 5.2 Audit Logging for Admin Actions
**Issue:** Audit logging exists but needs to be comprehensive.

**Tasks:**
- [ ] Verify all admin actions are logged:
  - ✅ CRUD operations (already done)
  - [ ] Role changes
  - [ ] User blocking/unblocking
  - [ ] Booking approvals/rejections
  - [ ] Event publishing
  - [ ] Content updates
- [ ] Add IP address and user agent tracking (already done in `lib/audit.ts`)
- [ ] Create audit log viewer enhancements:
  - [ ] Export to CSV
  - [ ] Advanced filtering
  - [ ] Date range picker
- [ ] Set up audit log retention policy
- [ ] Document audit requirements

**Files to modify:**
- Verify all `app/actions/*.ts` files call `logAudit()`
- `app/admin/audit/page.tsx` - Add export feature

**Estimated effort:** 2-3 days

---

## Phase 6: Hydration & Rendering Safety (Medium Priority)

### 6.1 Fix Hydration Risks from Random Math
**Issue:** Random Math in render paths risks hydration mismatches.

**Tasks:**
- [ ] Audit all `Math.random()` calls in components
- [ ] Move to `useMemo` with stable dependencies (already done for particles)
- [ ] Add deterministic keys:
  ```typescript
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: `particle-${i}`, // deterministic key
      x: i * 10, // deterministic position
      // ... or seed-based random
    })),
    [count]
  )
  ```
- [ ] Disable randomness when motion is disabled
- [ ] Consider using seeded random for consistency:
  ```typescript
  function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }
  ```

**Files to audit:**
- `app/page.tsx` - Particle generation
- `components/common/Starfield.tsx`
- All animation components

**Estimated effort:** 1 day

---

## Phase 7: Testing & Quality Assurance (Ongoing)

### 7.1 Establish Testing Standards
**Tasks:**
- [ ] Set up E2E tests for critical paths:
  - Landing page navigation
  - Auth flows
  - Admin CRUD operations
- [ ] Set up visual regression tests
- [ ] Performance testing:
  - Lighthouse CI
  - Bundle size monitoring
  - Core Web Vitals tracking
- [ ] Accessibility testing:
  - Automated tests (axe-core)
  - Manual screen reader testing

**Estimated effort:** Ongoing

---

## Phase 8: CMS Enhancements (Authoring, Media, SEO)

### 8.1 Rich Text Editor
**Issue:** JSON editor is unfriendly for authors.

**Tasks:**
- [ ] Integrate a schema-first WYSIWYG (TipTap/Lexical/Slate).
- [ ] Define allowed nodes/marks (h1–h3, paragraph, lists, links, bold/italic) and custom blocks (CTA, quote).
- [ ] Sanitize on save and render; store canonical structured JSON plus HTML/plain-text projections.
- [ ] Require alt text on embeds; restrict link schemes (https/mailto/tel); add paste sanitization and toolbar limits.

### 8.2 Image Upload & Media Pipeline
**Issue:** No managed media for sections.

**Tasks:**
- [ ] Add upload endpoint backed by storage/CDN (e.g., S3/UploadThing) with type/size validation.
- [ ] Generate responsive derivatives (WebP/AVIF), store dimensions and focal point.
- [ ] Persist alt text and captions; return signed URLs for previews.
- [ ] Admin UI: drag/drop, multi-upload, progress, error states.

### 8.3 SEO Settings per Section
**Issue:** No per-section SEO controls.

**Tasks:**
- [ ] Add meta title/description, keywords, OG title/description/image, canonical URL, robots flags.
- [ ] Enforce length and required alt validations.
- [ ] Render into `<Head>`/OpenGraph and provide SERP/OG preview.

### 8.4 Preview, Drafts, Rollback
**Issue:** No safe review flow.

**Tasks:**
- [ ] Introduce states: draft/review/published/archived.
- [ ] Add preview tokens/links to render drafts server-side (“view as user”).
- [ ] Show diffs between versions; one-click rollback with audit log entry.

### 8.5 Content Templates
**Issue:** Authors need starting points.

**Tasks:**
- [ ] Ship templates (menu, equipment list, pricing table, CTA block) as schema-valid snippets.
- [ ] “Apply template” action to prefill forms without breaking validation.

### 8.6 Version History
**Issue:** Limited change tracking.

**Tasks:**
- [ ] Persist immutable versions on save/publish with who/when.
- [ ] Surface timeline with field-level diff and restore.
- [ ] Guard restores with confirmation and audit logging.

### 8.7 Gallery Manager
**Issue:** No gallery tooling.

**Tasks:**
- [ ] Per-section galleries with multi-upload, reorder (drag/drop), captions, alt text, and soft delete.
- [ ] Enforce max counts/file sizes; serve optimized derivatives.

### 8.8 FAQ Management
**Issue:** FAQs are unmanaged.

**Tasks:**
- [ ] Add FAQ entries (question, answer rich text, category, order) with add/edit/delete and reorder UI.
- [ ] Frontend: category filters, search, and schema.org FAQ markup.

---

## Implementation Priority Matrix

### 🔴 Critical (Do First)
1. **Middleware optimization** (4 hours) - Blocking public page caching
2. **Server-side role enforcement** (1-2 days) - Security issue
3. **Reduced motion support** (2-3 days) - Accessibility requirement

### 🟡 High Priority (Do Soon)
4. **SSR/streaming for landing** (2-3 days) - SEO/performance
5. **Remove unused code** (1 day) - Bundle size
6. **Keyboard navigation** (2 days) - Accessibility
7. **Audit logging completeness** (2-3 days) - Security/compliance

### 🟢 Medium Priority (Schedule)
8. **Architecture refactoring** (4-5 days) - Maintainability
9. **Route-level code splitting** (2-3 days) - Performance
10. **Dependency stabilization** (3-4 days) - Production readiness
11. **Hydration safety** (1 day) - Reliability

### 🔵 Ongoing
12. **Testing & QA** - Continuous improvement

---

## Success Metrics

### Performance
- [ ] TTFB < 600ms (currently: TBD)
- [ ] FCP < 1.8s (currently: TBD)
- [ ] LCP < 2.5s (currently: TBD)
- [ ] Bundle size < 200KB (main) (currently: TBD)

### Accessibility
- [ ] Lighthouse Accessibility score > 95
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader testing passed
- [ ] Keyboard navigation fully functional

### Security
- [ ] All admin actions require auth + role check
- [ ] All admin actions logged to audit log
- [ ] No unauthorized data access possible
- [ ] Middleware only affects protected routes

### Architecture
- [ ] Page components < 300 lines
- [ ] Clear separation of concerns
- [ ] All shared logic extracted to hooks/utils
- [ ] Code splitting on all heavy components

---

## Rollout Strategy

### Week 1-2: Critical Issues
- Middleware optimization
- Server-side role enforcement
- Reduced motion support

### Week 3-4: High Priority
- SSR/streaming implementation
- Remove unused code
- Keyboard navigation & ARIA

### Week 5-6: Architecture
- Break up monolithic component
- Route-level code splitting
- Audit logging completeness

### Week 7-8: Stabilization
- Dependency decisions & implementation
- Hydration safety
- Testing & documentation

### Week 9+: Ongoing
- Performance monitoring
- Security audits
- User feedback incorporation

---

## Risk Assessment

### High Risk
- **Dependency downgrade** - May break existing features, requires thorough testing
- **SSR refactoring** - Complex change, affects entire landing page

### Medium Risk
- **Architecture refactoring** - Large code changes, but isolated impact
- **Middleware changes** - Could affect auth flow if not tested properly

### Low Risk
- **Removing unused code** - Easy to verify, low impact
- **Accessibility improvements** - Additive changes, no breaking changes
- **Audit logging** - Additive, isolated changes

---

## Dependencies & Blockers

- Middleware optimization should be done **before** SSR work (affects caching strategy)
- Security fixes should be done **before** new features
- Architecture refactoring should wait until **after** SSR implementation
- Dependency decisions need **stakeholder approval**

---

## Documentation Requirements

- [ ] Update README with architecture changes
- [ ] Document SSR/CSR boundaries
- [ ] Create accessibility testing guide
- [ ] Update deployment guide with dependency info
- [ ] Document audit log retention policy
- [ ] Create performance monitoring playbook

---

## Review & Approval

**Prepared by:** Claude (AI Assistant)
**Date:** 2025-01-20
**Status:** Draft - Awaiting Review

**Stakeholders to approve:**
- [ ] Development Lead
- [ ] Security Team
- [ ] Product Owner
- [ ] DevOps Team
