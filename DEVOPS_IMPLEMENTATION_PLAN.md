# DevOps Implementation Plan

**Project:** Xplorium - Family Entertainment Venue Platform
**Date:** December 6, 2025
**Status:** Planning Phase

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Pre-Implementation Checklist](#pre-implementation-checklist-close-these-gaps-first)
3. [DevOps Goals](#devops-goals)
4. [Decisions & Policies](#decisions--policies)
5. [Implementation Phases](#implementation-phases)
6. [Technology Stack](#technology-stack)
7. [Detailed Implementation](#detailed-implementation)
8. [Timeline & Milestones](#timeline--milestones)
9. [Cost Estimation](#cost-estimation)
10. [Risk Assessment](#risk-assessment)

---

## Current State Analysis

### Existing Setup

**Hosting:**
- Platform: Vercel (Frontend + Serverless Functions)
- Database: Neon (Serverless PostgreSQL)
- No dedicated CI/CD pipeline
- Manual deployments via Git push to Vercel

**Current Tech Stack:**
- Next.js 16 (App Router)
- TypeScript 5
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth v5
- Tailwind CSS 4

**Testing:**
- E2E: Playwright tests (`./tests/`)
- Unit: Vitest tests (logger, components, hooks)
- **No automated test execution in CI/CD**

**Environment Management:**
- Single production environment (Vercel)
- No staging/preview environments
- Environment variables managed via Vercel dashboard
- `.env.local` for local development

**Monitoring:**
- Vercel Analytics (basic)
- No error tracking
- No performance monitoring
- No uptime monitoring
- No logging aggregation

**Security:**
- HTTPS via Vercel
- Environment variables secured
- No secrets management system
- No automated security scanning
- No dependency vulnerability checks

**Gaps & Pain Points (To-Do):**
1. [ ] Automate testing before deployment
2. [ ] Stand up a staging environment
3. [ ] Automate database migrations with rollback paths
4. [ ] Define and document rollback strategy
5. [ ] Add monitoring and alerting
6. [ ] Implement automated backups and restoration tests
7. [ ] Add performance tracking
8. [ ] Add error tracking
9. [ ] Add security scanning
10. [ ] Add infrastructure as code coverage

---

## Pre-Implementation Checklist (Close These Gaps First)

- [ ] Confirm owners, budget, and target dates; update status/date here if they change
- [ ] Create `develop` branch and apply branch protection rules on `main` and `develop`
- [ ] Stand up Vercel staging project + Neon staging branch; map env vars from the table below
- [ ] Add required GitHub secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DATABASE_URL`, `DATABASE_URL_TEST`, `NEXTAUTH_SECRET`, Sentry/Snyk/Sonar/AWS as needed)
- [ ] Ensure referenced scripts/configs exist (`scripts/backup-database.sh`, health check route, logger config) and are executable
- [ ] Decide on monitoring/logging vendors (Sentry project, Better Uptime monitors, Logtail source token) and create accounts
- [ ] Decide on code-quality vendor (SonarCloud org/project key) and add `sonar-project.properties`
- [ ] Decide on dependency scanning approach (Snyk token or Dependabot) and add `.github/workflows/security.yml`
- [ ] Define backup bucket/credentials (AWS S3 or alternative) and retention policy
- [ ] Document rollback and recovery runbooks before enabling auto-deploy to production
- [ ] Define SLOs and alert thresholds (uptime, p95 latency, error rate) and wire alerts to Slack/Email
- [ ] Set cost guardrails (CI minutes, log volume, monitoring events) and usage alerts
- [ ] Write flaky test handling policy (retry/quarantine) and Playwright timeout defaults for CI
- [ ] Confirm release gating (green CI + staging deploy + smoke tests + manual approval) before prod deploys
- [ ] Decide on staging data refresh/obfuscation policy (masked snapshots from prod)

---

## DevOps Goals

### Primary Objectives

1. **Automated CI/CD Pipeline**
   - Automated testing on every push
   - Automated deployments to staging/production
   - Zero-downtime deployments

2. **Environment Management**
   - Development -> Staging -> Production pipeline
   - Preview deployments for feature branches
   - Environment parity

3. **Quality Assurance**
   - Automated E2E and unit tests
   - Code quality checks (linting, type checking)
   - Security vulnerability scanning
   - Performance testing

4. **Monitoring & Observability**
   - Real-time error tracking
   - Performance monitoring (APM)
   - Uptime monitoring
   - Log aggregation
   - User analytics

5. **Database Management**
   - Automated migrations
   - Automated backups
   - Point-in-time recovery
   - Staging database sync

6. **Security & Compliance**
   - Secrets management
   - Dependency vulnerability scanning
   - GDPR compliance tooling
   - Automated security audits

7. **Developer Experience**
   - Fast feedback loops
   - Easy local development setup
   - Clear deployment status
   - Self-service rollbacks

---

## Decisions & Policies

- **Ownership & Dates:** Assign an owner per phase/stream and pin real calendar dates; update the Status/Date at the top accordingly.
- **Environment Parity:** Staging matches prod (Node/Prisma versions, middleware, feature flags); staging DB refreshed from prod with masked PII on a schedule.
- **Secrets Management:** Decide Vercel-only vs. adding Doppler; set rotation cadence and access rules.
- **Release Gating:** Prod deploy requires green CI, staging deploy, smoke tests, and a manual approval step in GitHub Actions.
- **Rollback Runbooks:** Document app rollback (revert deploy), Prisma migration rollback, and Neon branch fallback; link from the deploy pipeline.
- **Infrastructure as Code:** Use Terraform (or chosen tool) for Vercel/Neon/S3/secrets; plan a state backend and repo layout.
- **SLOs & Alerts:** Define target SLOs (e.g., 99.9% uptime, p95 latency) and alert thresholds (warning/critical) wired to Slack/Email.
- **Cost Guardrails:** Set monthly caps/alerts for CI minutes, log ingestion, monitoring events, and backups/storage.
- **Flaky Tests:** Policy for retries, quarantine list, and default CI timeouts (especially Playwright) to keep pipelines reliable.
- **Security Scans:** Per-PR dependency review + weekly full scan; include secret scanning (GitHub secret scanning or TruffleHog).

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Establish basic CI/CD pipeline and testing automation

- ✅ Set up GitHub Actions
- ✅ Automate testing (E2E + Unit)
- ✅ Automate linting and type checking
- ✅ Set up staging environment
- ✅ Configure environment variables

**Deliverables:**
- Working CI/CD pipeline
- Staging environment on Vercel
- Automated test execution

---

### Phase 2: Quality & Security (Week 3-4)
**Goal:** Implement quality gates and security scanning

- ✅ Dependency vulnerability scanning
- ✅ Code quality metrics (SonarCloud/CodeClimate)
- ✅ Pre-commit hooks (Husky)
- ✅ Branch protection rules
- ✅ Security headers audit

**Deliverables:**
- Automated security scans
- Code quality dashboard
- Protected main branch

---

### Phase 3: Monitoring & Observability (Week 5-6)
**Goal:** Implement comprehensive monitoring

- ✅ Error tracking (Sentry)
- ✅ Performance monitoring (Vercel Analytics Pro or alternative)
- ✅ Uptime monitoring (UptimeRobot/Better Uptime)
- ✅ Log aggregation (Logtail/Datadog)
- ✅ Alerting (Slack/Email)

**Deliverables:**
- Real-time error alerts
- Performance dashboards
- Uptime status page

---

### Phase 4: Database & Backup (Week 7-8)
**Goal:** Automate database operations and backups

- ✅ Automated database migrations
- ✅ Automated backups (Neon native + S3)
- ✅ Backup restoration testing
- ✅ Database staging environment
- ✅ Migration rollback procedures

**Deliverables:**
- Automated migration pipeline
- Daily backups with retention policy
- Recovery runbook

---

### Phase 5: Advanced DevOps (Week 9-12)
**Goal:** Implement advanced features and optimization

- ✅ Feature flags (LaunchDarkly/Unleash)
- ✅ A/B testing framework
- ✅ Performance budgets
- ✅ Lighthouse CI
- ✅ Load testing (k6/Artillery)
- ✅ Disaster recovery plan

**Deliverables:**
- Feature flag system
- Performance monitoring with budgets
- Comprehensive DR plan

---

## Technology Stack

### CI/CD Platform
**Recommended: GitHub Actions**

**Pros:**
- ✅ Free for public repos, generous free tier for private
- ✅ Native GitHub integration
- ✅ Large marketplace of actions
- ✅ Matrix builds for parallel testing
- ✅ Secrets management built-in

**Alternatives:**
- GitLab CI/CD (if migrating to GitLab)
- CircleCI (better caching, paid)
- Jenkins (self-hosted, complex setup)

**Decision: GitHub Actions** (already using GitHub)

---

### Hosting & Deployment
**Current: Vercel**

**Keep Vercel:**
- ✅ Excellent Next.js support
- ✅ Zero-config deployments
- ✅ Automatic HTTPS
- ✅ Edge network (CDN)
- ✅ Preview deployments per PR
- ✅ Generous free tier

**Vercel Environments:**
- **Production:** `xplorium.com` (or current domain)
- **Staging:** `staging.xplorium.vercel.app`
- **Preview:** Auto-generated per PR

---

### Database Management
**Current: Neon PostgreSQL**

**Neon Features to Utilize:**
- ✅ Branching (staging database)
- ✅ Point-in-time recovery
- ✅ Automated backups
- ✅ Connection pooling

**Additional Tools:**
- **Prisma Migrate:** Schema migrations
- **Prisma Studio:** Database GUI (already have)
- **pg_dump:** Additional backup strategy

---

### Error Tracking
**Recommended: Sentry**

**Why Sentry:**
- ✅ Excellent Next.js integration
- ✅ Source maps support
- ✅ Release tracking
- ✅ User context
- ✅ Performance monitoring (APM)
- ✅ Generous free tier (5k events/month)

**Setup:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Alternatives:**
- Rollbar (simpler, less features)
- Bugsnag (paid, good for mobile)
- LogRocket (session replay focus)

---

### Monitoring & Analytics
**Recommended Stack:**

1. **Uptime Monitoring: Better Uptime**
   - 10 monitors free
   - Status page
   - Incident management
   - Slack/Email alerts

2. **Performance: Vercel Analytics**
   - Already integrated
   - Core Web Vitals
   - Real user monitoring

3. **Logs: Logtail (by Better Stack)**
   - Free tier: 1GB/month
   - Structured logging
   - Live tail
   - Querying & filtering

**Alternative:**
- Datadog (comprehensive, expensive)
- New Relic (APM focused, expensive)
- Grafana Cloud (free tier, steeper learning curve)

---

### Code Quality
**Recommended: SonarCloud**

**Features:**
- ✅ Free for open source
- ✅ Code coverage tracking
- ✅ Security vulnerability detection
- ✅ Code smells & technical debt
- ✅ PR decoration

**Alternative:**
- CodeClimate (simpler, paid)
- Codacy (automated reviews)

---

### Security Scanning
**Recommended: Snyk**

**Features:**
- ✅ Dependency vulnerability scanning
- ✅ License compliance
- ✅ Container scanning (if using Docker)
- ✅ Free tier available
- ✅ Auto-fix PRs

**Alternative:**
- Dependabot (GitHub native, basic)
- WhiteSource Renovate (dependency updates)

---

### Secrets Management
**Recommended: Vercel Environment Variables + Doppler**

**Doppler:**
- ✅ Centralized secrets management
- ✅ Environment syncing
- ✅ Audit logs
- ✅ Team access control
- ✅ Free tier for small teams

**Alternative:**
- HashiCorp Vault (self-hosted, complex)
- AWS Secrets Manager (if using AWS)
- Keep Vercel native (simpler, less features)

---

## Detailed Implementation

### Phase 1: Foundation

#### 1.1 GitHub Actions CI/CD Pipeline

**File: `.github/workflows/ci.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # Job 1: Lint and Type Check
  quality-checks:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: TypeScript type check
        run: npx tsc --noEmit

  # Job 2: Unit Tests
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit:run

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  # Job 3: E2E Tests
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build Next.js app
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

      - name: Run Playwright tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  # Job 4: Build Check
  build:
    name: Production Build
    runs-on: ubuntu-latest
    needs: [quality-checks, unit-tests]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

  # Job 5: Deploy to Staging (on develop branch)
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [quality-checks, unit-tests, e2e-tests, build]
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Staging
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  # Job 6: Deploy to Production (on main branch)
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [quality-checks, unit-tests, e2e-tests, build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Production
        run: vercel deploy --prod --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
```

**Required GitHub Secrets:**
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
DATABASE_URL
DATABASE_URL_TEST (for testing)
NEXTAUTH_SECRET
SENTRY_AUTH_TOKEN (Phase 3)
SENTRY_ORG (Phase 3)
SENTRY_PROJECT (Phase 3)
```

---

#### 1.2 Branch Strategy

**Git Flow Model:**

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (preview deployments)
hotfix/* (emergency fixes)
```

**Branch Protection Rules (main):**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass (all CI jobs)
- ✅ Require branches to be up to date
- ✅ No force pushes
- ✅ No deletions

**Branch Protection Rules (develop):**
- ✅ Require status checks to pass
- ✅ Allow squash merging

---

#### 1.3 Environment Setup

**Vercel Projects:**

1. **Production Project**
   - Domain: `xplorium.com`
   - Branch: `main`
   - Database: Neon production branch

2. **Staging Project**
   - Domain: `staging-xplorium.vercel.app`
   - Branch: `develop`
   - Database: Neon staging branch

**Environment Variables per Environment:**

| Variable | Production | Staging | Local |
|----------|-----------|---------|-------|
| `NODE_ENV` | `production` | `production` | `development` |
| `NEXTAUTH_URL` | `https://xplorium.com` | `https://staging-xplorium.vercel.app` | `http://localhost:3000` |
| `DATABASE_URL` | Neon Production | Neon Staging | Neon Dev |
| `NEXTAUTH_SECRET` | Prod Secret | Staging Secret | Dev Secret |
| `UPSTASH_REDIS_URL` | Prod Redis | Staging Redis | Local Redis |

---

### Phase 2: Quality & Security

#### 2.1 Dependency Scanning

**File: `.github/workflows/security.yml`**

```yaml
name: Security Scanning

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    # Run every Monday at 9 AM
    - cron: '0 9 * * 1'

jobs:
  snyk:
    name: Snyk Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Dependency Review
        uses: actions/dependency-review-action@v3
```

---

#### 2.2 Code Quality

**SonarCloud Setup:**

```yaml
# Add to .github/workflows/ci.yml

sonarcloud:
  name: SonarCloud Analysis
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Shallow clones disabled for better analysis

    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**File: `sonar-project.properties`**

```properties
sonar.projectKey=xplorium-platform
sonar.organization=your-org

sonar.sources=.
sonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.test.tsx,.next/**,coverage/**

sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/tests/**
```

---

#### 2.3 Pre-commit Hooks

**Install Husky:**

```bash
npm install --save-dev husky lint-staged
npx husky init
```

**File: `.husky/pre-commit`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**File: `package.json` (add):**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

---

### Phase 3: Monitoring & Observability

#### 3.1 Sentry Error Tracking

**Installation:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**File: `sentry.client.config.ts`**

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.level === 'warning') {
      return null
    }
    return event
  },
})
```

**File: `sentry.server.config.ts`**

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  integrations: [
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
})
```

**Environment Variables:**
```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=xplorium
SENTRY_AUTH_TOKEN=sntrys_...
```

---

#### 3.2 Uptime Monitoring

**Better Uptime Setup:**

1. Create account at betteruptime.com
2. Add monitors:
   - `https://xplorium.com` (Homepage)
   - `https://xplorium.com/api/health` (Health check endpoint)
   - `https://xplorium.com/booking` (Booking page)

3. Configure alerts:
   - Slack webhook
   - Email notifications
   - SMS (optional, paid)

**Create Health Check Endpoint:**

**File: `app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    // Check Redis connection (if using)
    // await redis.ping()

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'operational',
        // redis: 'operational',
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
```

---

#### 3.3 Structured Logging

**Install Logtail:**

```bash
npm install @logtail/node @logtail/winston
```

**Update `lib/logger.ts`:**

```typescript
import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import winston from 'winston'

const logtail = process.env.LOGTAIL_SOURCE_TOKEN
  ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
  : null

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
]

if (logtail) {
  transports.push(new LogtailTransport(logtail))
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'xplorium-platform',
    environment: process.env.NODE_ENV,
  },
  transports,
})
```

---

### Phase 4: Database & Backup

#### 4.1 Automated Migrations

**File: `.github/workflows/migrate.yml`**

```yaml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    name: Run Migrations
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ github.event.inputs.environment == 'production' && secrets.DATABASE_URL_PROD || secrets.DATABASE_URL_STAGING }}

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Migration ${{ job.status }} on ${{ github.event.inputs.environment }}"
            }
```

---

#### 4.2 Automated Backups

**Neon Native Backups:**
- Neon provides automated backups
- Configure retention in Neon dashboard
- Test restore procedure monthly

**Additional S3 Backup Script:**

**File: `scripts/backup-database.sh`**

```bash
#!/bin/bash

# Database backup script
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="backup-$DATE.sql"

echo "Starting database backup..."

# Use pg_dump (requires PostgreSQL client)
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3 (requires AWS CLI)
aws s3 cp $BACKUP_FILE.gz s3://xplorium-backups/database/$BACKUP_FILE.gz

# Cleanup local file
rm $BACKUP_FILE.gz

echo "Backup completed: $BACKUP_FILE.gz"
```

**Cron Job (GitHub Actions):**

```yaml
name: Database Backup

on:
  schedule:
    # Daily at 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install PostgreSQL client
        run: sudo apt-get install -y postgresql-client

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Run backup
        run: ./scripts/backup-database.sh
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

### Phase 5: Advanced DevOps

#### 5.1 Performance Monitoring

**Lighthouse CI Setup:**

```bash
npm install --save-dev @lhci/cli
```

**File: `lighthouserc.js`**

```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/booking',
        'http://localhost:3000/admin',
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

**Add to CI:**

```yaml
lighthouse:
  name: Lighthouse CI
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm run build
    - run: npx lhci autorun
```

---

#### 5.2 Load Testing

**Install k6:**

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**File: `tests/load/booking-flow.js`**

```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 50 },  // Spike to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
}

export default function () {
  // Load homepage
  let res = http.get('https://staging-xplorium.vercel.app')
  check(res, {
    'homepage loaded': (r) => r.status === 200,
  })

  sleep(1)

  // Load booking page
  res = http.get('https://staging-xplorium.vercel.app/booking')
  check(res, {
    'booking page loaded': (r) => r.status === 200,
  })

  sleep(2)
}
```

**Run:**
```bash
k6 run tests/load/booking-flow.js
```

---

## Timeline & Milestones

### Week 1-2: Foundation
- [ ] Set up GitHub Actions workflow
- [ ] Configure Vercel staging environment
- [ ] Implement automated testing
- [ ] Set up branch protection rules
- [ ] Document deployment process

**Milestone:** Working CI/CD with staging deployments

---

### Week 3-4: Quality & Security
- [ ] Integrate Snyk scanning
- [ ] Set up SonarCloud
- [ ] Configure Husky pre-commit hooks
- [ ] Implement code review process
- [ ] Security audit

**Milestone:** Automated quality gates in place

---

### Week 5-6: Monitoring & Observability
- [ ] Integrate Sentry
- [ ] Set up Better Uptime monitoring
- [ ] Implement Logtail logging
- [ ] Create health check endpoint
- [ ] Configure Slack alerts

**Milestone:** Full observability stack operational

---

### Week 7-8: Database & Backup
- [ ] Automate database migrations
- [ ] Set up daily backups to S3
- [ ] Test backup restoration
- [ ] Create staging database sync
- [ ] Document recovery procedures

**Milestone:** Database operations fully automated

---

### Week 9-12: Advanced DevOps
- [ ] Implement feature flags
- [ ] Set up Lighthouse CI
- [ ] Create load testing suite
- [ ] Implement performance budgets
- [ ] Write disaster recovery plan
- [ ] Team training

**Milestone:** Production-grade DevOps platform

---

## Cost Estimation

### Free Tier (Current)

| Service | Free Tier | Current Usage | Cost |
|---------|-----------|---------------|------|
| **Vercel** | Hobby (1 team member) | Production + Staging | $0 |
| **Neon** | Free tier (0.5GB storage) | Production DB | $0 |
| **GitHub Actions** | 2,000 min/month | ~500 min/month | $0 |
| **Sentry** | 5k events/month | ~2k events/month | $0 |
| **Better Uptime** | 10 monitors | 3 monitors | $0 |
| **Logtail** | 1GB/month | ~300MB/month | $0 |
| **Snyk** | Unlimited scans (open source) | Weekly scans | $0 |

**Total Current Cost: $0/month**

---

### Recommended Paid Tier (Production Ready)

| Service | Plan | Cost | Features |
|---------|------|------|----------|
| **Vercel** | Pro | $20/mo | Unlimited bandwidth, better analytics |
| **Neon** | Scale | $19/mo | 10GB storage, point-in-time recovery |
| **GitHub** | Team | $4/user/mo | Advanced security, required reviewers |
| **Sentry** | Team | $26/mo | 50k events, 1-day retention |
| **Better Uptime** | Premium | $25/mo | 50 monitors, status page |
| **Logtail** | Pro | $10/mo | 5GB logs, 7-day retention |
| **Snyk** | Team | $52/mo | Unlimited projects, auto-fix |
| **SonarCloud** | - | Free | (For open source) |
| **AWS S3** | Pay-as-you-go | ~$5/mo | Backup storage |

**Total Recommended Cost: $161/month** (~$1,932/year)

---

### Enterprise Scale (High Traffic)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Enterprise | $250+/mo |
| Neon | Business | $69+/mo |
| Sentry | Business | $80+/mo |
| Datadog | Pro | $150+/mo |

**Total Enterprise Cost: $500+/month**

---

## Risk Assessment

### High Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Database migration failure** | Critical | Medium | • Test migrations on staging<br>• Automated backups<br>• Rollback procedures |
| **Deployment downtime** | High | Low | • Blue-green deployments (Vercel native)<br>• Health checks<br>• Automatic rollback |
| **Secrets leaked in CI/CD** | Critical | Low | • GitHub encrypted secrets<br>• Secret scanning<br>• Rotate regularly |
| **Test flakiness blocking deploys** | Medium | High | • Retry failed tests<br>• Identify flaky tests<br>• Manual override for emergencies |
| **Third-party service outage** | Medium | Medium | • Fallback mechanisms<br>• Circuit breakers<br>• Monitoring |

---

### Medium Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **High CI/CD costs** | Medium | Low | • Monitor usage<br>• Cache dependencies<br>• Optimize workflows |
| **False positive security alerts** | Low | High | • Tune severity thresholds<br>• Regular triage<br>• Ignore files |
| **Developer resistance** | Medium | Medium | • Training sessions<br>• Clear documentation<br>• Gradual rollout |

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Deployment Frequency**
   - Current: Manual (~1-2/week)
   - Target: 5-10/week (automated)

2. **Lead Time for Changes**
   - Current: Hours to days
   - Target: < 1 hour (commit to production)

3. **Mean Time to Recovery (MTTR)**
   - Current: Unknown (no monitoring)
   - Target: < 1 hour

4. **Change Failure Rate**
   - Current: Unknown
   - Target: < 5%

5. **Test Coverage**
   - Current: ~40% (estimated)
   - Target: > 80%

6. **Build Time**
   - Current: ~3 minutes
   - Target: < 5 minutes

7. **Uptime**
   - Current: Unknown
   - Target: 99.9% (8.76 hours downtime/year)

---

## Next Steps

### Immediate Actions (This Week)

1. **Decision Making:**
   - [ ] Review and approve plan
   - [ ] Confirm budget allocation
   - [ ] Assign DevOps champion/owner

2. **Account Setup:**
   - [ ] Create Vercel staging project
   - [ ] Sign up for Sentry
   - [ ] Sign up for Better Uptime
   - [ ] Sign up for Snyk

3. **Repository Preparation:**
   - [ ] Create `develop` branch
   - [ ] Set up branch protection
   - [ ] Add GitHub secrets

4. **Documentation:**
   - [ ] Create CONTRIBUTING.md
   - [ ] Document environment setup
   - [ ] Create deployment runbook

### Week 1 Implementation

1. **GitHub Actions:**
   - [ ] Create `.github/workflows/ci.yml`
   - [ ] Test CI pipeline on feature branch
   - [ ] Fix any failing tests

2. **Vercel Staging:**
   - [ ] Create staging project
   - [ ] Configure environment variables
   - [ ] Deploy develop branch

3. **Testing:**
   - [ ] Run full test suite
   - [ ] Fix flaky tests
   - [ ] Add missing test coverage

---

## Conclusion

This DevOps implementation plan provides a comprehensive, phased approach to modernizing the Xplorium platform's development and deployment workflow. The plan prioritizes:

- ✅ **Quick Wins:** Automated testing and CI/CD in Week 1-2
- ✅ **Safety:** Multiple quality gates and monitoring
- ✅ **Cost-Effectiveness:** Start with free tiers, scale as needed
- ✅ **Developer Experience:** Clear workflows, fast feedback
- ✅ **Production Readiness:** Full observability and disaster recovery

**Recommended Approach:**
- Start with Phase 1 (Foundation) immediately
- Run Phase 2-3 in parallel after Phase 1 is stable
- Phase 4-5 can be implemented based on business needs

**Total Implementation Time:** 8-12 weeks for full rollout

---

## Appendix

### A. Useful Commands

```bash
# CI/CD
vercel --prod                    # Deploy to production
vercel --prebuilt               # Deploy pre-built

# Database
npx prisma migrate dev          # Create migration
npx prisma migrate deploy       # Apply migrations
npx prisma db push              # Push schema (dev only)

# Testing
npm test                        # Run E2E tests
npm run test:unit:run           # Run unit tests
npm run test:unit:coverage      # Coverage report

# Build
npm run build                   # Production build
npm run lint                    # Run linter
npx tsc --noEmit               # Type check

# Monitoring
vercel logs                     # View deployment logs
```

---

### B. Resources

**Documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Prisma Docs](https://www.prisma.io/docs)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

**Tools:**
- [Vercel CLI](https://vercel.com/docs/cli)
- [GitHub CLI](https://cli.github.com/)
- [Prisma Studio](https://www.prisma.io/studio)

**Community:**
- [Vercel Discord](https://vercel.com/discord)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)
- [DevOps Subreddit](https://www.reddit.com/r/devops/)

---

**Document Version:** 1.0
**Last Updated:** December 6, 2025
**Owner:** DevOps Team
**Status:** Ready for Implementation 🚀
