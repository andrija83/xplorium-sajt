# Full-Stack Audit (ChatGPT)

> Scope: Rapid written audit based on repository structure, docs, and conventions observed (Next.js App Router, Prisma, NextAuth, Tailwind, Vercel/Neon). Validate and adjust after deeper code review and runtime verification.

## 1. 🔥 High-Level Summary
- **Frontend:** Next.js App Router with Tailwind; needs stricter performance hygiene (render budgeting, lazy boundaries) and accessibility pass (ARIA, keyboard flows).
- **Backend:** API routes + server actions; Prisma + NextAuth; add stronger validation, authz, rate limiting, and consistent error envelopes.
- **DB (Neon/Postgres + Prisma):** Schema likely adequate but needs enforced constraints, indexes on relational lookups, and migration/runbook hardening.
- **Overall:** Productive stack with good primitives; upgrade guardrails (security, observability, perf) and enforce consistency via lint/tests/CI gates.

## 2. 🧨 Critical Issues (must fix)
1) Input validation gaps on API routes/server actions (zod/yup) → injection/logic risks.  
2) Authorization checks likely missing/uneven beyond NextAuth session presence.  
3) Rate limiting/abuse protection on public endpoints (especially auth/uploads) not enforced.  
4) Secrets handling: ensure no `.env` leakage, rotate NEXTAUTH_SECRET/DB creds, and tighten `.env.example`.  
5) Database integrity: add UNIQUE/NOT NULL/FK constraints where business rules require; ensure migrations tested on staging.  
6) Monitoring/alerts absent: no error tracking/uptime/log aggregation → invisible failures.

## 3. 🛠️ Detailed Full-Stack Review

### Frontend
- **Architecture:** App Router pages plus shared components/hooks; review co-location vs. shared libraries to avoid duplication; add feature folders for booking/profile/admin flows.
- **Hooks/State:** Audit `useEffect` dependencies; memoize expensive derived data with `useMemo`; wrap callbacks passed deep (`useCallback`); prefer server components where possible; keep client state minimal.
- **Rendering/Perf:** Add suspense/lazy for heavy routes, charts, and admin views; image optimization via `next/image`; guard against waterfall data fetching; cache via `react-cache`/RSC fetch.
- **Accessibility:** Enforce semantic tags; ensure form controls are labeled; focus traps for dialogs/modals; keyboard navigation; color contrast checks; add `aria-live` for async states.
- **Security:** Sanitize/encode any user-supplied HTML; prefer server-side session reads; avoid exposing secrets in client bundles; use `fetch` with relative URLs and CSRF protections on mutations.

### Backend (API/Logic)
- **Layering:** Introduce clear service modules for booking/payments/users; keep route handlers thin; centralize validation (zod schemas) and authz guards.
- **API Quality:** Standardize error envelope `{error:{code,message}}`; add pagination to list endpoints; consistent HTTP verbs/resources; document contracts (OpenAPI).
- **Security:** Per-route authz (role/ownership checks); enforce CSRF on POST/PUT/DELETE if using cookies; input validation everywhere; secret loading via env schema (zod + `process.env` guard); enable Dependabot/Snyk.
- **Perf/Scalability:** Avoid N+1 in Prisma (use `include`/`select`); add caching for read-heavy endpoints (Redis/Edge config where safe); move long tasks to background jobs/queues (e.g., emails, reports).
- **Maintainability:** Logging with correlation IDs; structured logger; common error handler util; test coverage for services and API handlers; lint/typecheck in CI.
- **DevOps alignment:** Add healthcheck endpoint; readiness for observability (Sentry/Logtail); rate limiting middleware (Upstash/edge or in-route guard).

### Database / Prisma
- **Schema:** Review naming consistency; enforce NOT NULL on required business fields; add `createdAt/updatedAt` everywhere; soft-delete fields need partial indexes to avoid unique clashes.
- **Relations:** Add FK constraints; cascade/RESTRICT policies explicit; ensure junction tables for many-to-many; avoid nullable foreign keys where not needed.
- **Indexes:** Add composite indexes on lookup patterns (e.g., `userId,status`, `bookingId,startsAt`); partial indexes for soft-deleted records; unique indexes for natural keys (email, external IDs).
- **Integrity:** Use CHECKs for enum-like values or migrate to Postgres enums; ensure transaction boundaries on multi-step writes; add migration rollback runbook and staging-first practice.
- **Scalability:** Plan read replicas (Neon); connection pooling; consider partitioning for time-series/log-like tables if volume grows; add caching in front of frequent read endpoints.

### Integration
- Align DTOs between frontend and backend; type-share via `@/types` (generated from OpenAPI/zod).  
- Normalize error shapes; surface user-friendly messages in UI with retry guidance.  
- Consistency in date/number formatting (timezone handling) across layers.  
- Avoid duplicate validation: define once (zod) and reuse on client/server.

## 4. 📦 Refactored Code Examples

### API Handler (Next.js App Router)
```ts
// app/api/bookings/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/auth'
import { bookingsService } from '@/services/bookings'
import { withRateLimit } from '@/lib/rate-limit'

const createSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  guests: z.number().int().positive().max(20),
  notes: z.string().max(500).optional(),
})

export const POST = withRateLimit(async (req) => {
  const session = await requireSession(req)
  const body = await req.json()
  const input = createSchema.parse(body)
  const booking = await bookingsService.create(session.user.id, input)
  return NextResponse.json(booking, { status: 201 })
})
```

### Service Layer
```ts
// services/bookings.ts
import { prisma } from '@/lib/prisma'

export const bookingsService = {
  async create(userId: string, dto: { startsAt: string; endsAt: string; guests: number; notes?: string }) {
    return prisma.$transaction(async (tx) => {
      // add availability checks as needed
      return tx.booking.create({
        data: {
          userId,
          startsAt: new Date(dto.startsAt),
          endsAt: new Date(dto.endsAt),
          guests: dto.guests,
          notes: dto.notes,
        },
      })
    })
  },
}
```

### Hook Pattern
```ts
// hooks/useAsync.ts
import { useState, useCallback } from 'react'

export function useAsync<TArgs extends any[], TResult>(fn: (...args: TArgs) => Promise<TResult>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const run = useCallback(async (...args: TArgs) => {
    setLoading(true)
    setError(null)
    try {
      return await fn(...args)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { run, loading, error }
}
```

### Prisma Schema Hardening
```prisma
model Booking {
  id        String   @id @default(cuid())
  userId    String
  startsAt  DateTime
  endsAt    DateTime
  guests    Int
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startsAt])
  @@check(endsAt > startsAt)
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  bookings  Booking[]
}
```

## 5. 🎯 Improved Architecture Proposal
- **Folder structure (suggested):**
  - `app/` (routes)
  - `services/` (domain logic per bounded context)
  - `lib/` (shared libs: auth, validation, logger, rate-limit, http client)
  - `components/` (UI primitives) + `features/<domain>/` (composed UI + hooks)
  - `types/` (shared DTOs, generated from OpenAPI/zod)
  - `tests/` (unit/integration/e2e)
- **Data flow (text):** UI -> feature hook -> API client -> API route -> service -> Prisma -> DB; responses -> normalizer -> UI state. Errors/logs go to logger (Sentry/Logtail).
- **API contracts:** Standardize on JSON:API-like shapes or simple REST with `{data, meta}` envelopes; include pagination cursors; define zod schemas and generate client types.

## 6. 🚀 Full Implementation Plan

### A. Immediate (0–24h)
- Add input validation to all API routes/server actions; fail fast with 400.  
- Enforce authz checks (role/ownership) on protected routes.  
- Add basic rate limiting on auth/public endpoints.  
- Lock env handling: validate required vars at boot; scrub secrets from logs; ensure `.env` not committed.  
- Create monitoring bootstrap (Sentry) and uptime check endpoint.  
- Review Prisma schema for missing UNIQUE/NOT NULL/FK constraints; add CHECKs for obvious invariants.

### B. Short-Term (1–7 days)
- Introduce service layer modules; refactor heaviest API routes to use them.  
- Standardize API error/response envelopes; add pagination to list endpoints.  
- Add structured logging and request IDs; integrate with Logtail/Datadog.  
- Improve frontend: memoization where needed, lazy-load heavy components, accessibility pass on forms/dialogs.  
- Add tests: unit (services), integration (API), Playwright smoke paths in CI.  
- Add `.github/workflows/security.yml` (Snyk/Dependabot), lint/typecheck/test gates.

### C. Medium-Term (1–4 weeks)
- Implement IaC (Terraform) for Vercel/Neon/S3/secrets; stage-first deploys.  
- Add caching (Redis/edge) for read-heavy endpoints; ETag/Cache-Control where safe.  
- Build reusable hooks (`useAsync`, `usePaginatedQuery`), form schema validation shared via zod.  
- Strengthen DB: composite/partial indexes; soft-delete patterns with partial uniques; migration rollback playbooks.  
- Expand observability: traces/metrics dashboards; SLA/SLO alerts; error budgets.  
- Improve UX: skeletons/suspense boundaries, loading states, offline/resume where relevant.

### D. Long-Term (1–3 months)
- Adopt design system (tokens, primitives) and storybook/visual regression testing.  
- Advanced caching + CDN strategy; image/CDN policies.  
- Add queues/workers for long-running tasks (emails, reports, sync jobs).  
- Zero-downtime migration patterns; blue/green or canary deploys.  
- Security hardening: CSP, rate limits per route, device/session management, periodic pen-test.

### E. Tooling Recommendations
- **Frontend:** Storybook, Ladle, ESLint A11y, Bundle Analyzer, React Profiler.  
- **Backend:** Zod/Valibot for schemas, Pino/Winston for logs, OpenAPI + typed client, Upstash for rate limiting.  
- **Database:** Prisma, pgbouncer/pooler (Neon handles), migra for drift checks.  
- **DevOps:** GitHub Actions CI/CD with test/lint/typecheck/build; Sentry; Logtail/Datadog; Better Uptime; Terraform.  
- **Testing:** Vitest for unit, Playwright for e2e, k6 for load, jest-axe/a11y linters.

### F. Safe Refactor Strategy
- Inventory endpoints and map to service modules; refactor one domain at a time behind feature flags.  
- Add contract tests before refactors; ensure back-compat response shapes.  
- Migrate DB changes with staged deploy: apply migrations on staging, back up, then prod with health checks.  
- Gradual rollout with canary deploys and feature flags; monitor SLO dashboards; rollback plan ready.  
- Keep changelog and runbooks updated; pair reviews for high-risk changes.
