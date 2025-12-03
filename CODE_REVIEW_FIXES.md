# Code Review Fixes - Phased Implementation Plan

**Review Date:** December 3, 2025
**Security Score:** 7.5/10
**Status:** In Progress

---

## 📋 Phase 1: Critical Security & Data Integrity (IMMEDIATE)

**Priority:** 🔴 CRITICAL
**Timeline:** Complete before any production deployment
**Estimated Time:** 2-3 hours

### ✅ Tasks

- [x] **1.1 Fix Schema Mismatch in Export/Import** ✅ COMPLETED
  - **Files:** `app/actions/export.ts`, `app/actions/import.ts`
  - **Issue:** Field names don't match Prisma schema
  - **Action Taken:** Updated to use correct fields:
    - `timeSlot` → `time` ✓
    - `numberOfChildren/numberOfAdults` → `guestCount` ✓
    - `totalPrice` → `totalAmount` ✓
    - Fixed Event fields: `startDate`/`endDate` → `date`, `type` → `category`, `imageUrl` → `image` ✓
    - Fixed AuditLog orderBy: `timestamp` → `createdAt` ✓
  - **Changes Made:**
    - Export bookings now includes: Title, Time, Type, Guest Count, Total Amount, Currency, Paid Amount, Is Paid, Admin Notes
    - Export events now includes: Slug, Date, Time, End Time, Category, Capacity, Registered Count, Price, Currency, Location, Is Recurring, Image, Tags
    - Import bookings validates: Title, Date, Time, Type, Guest Count, Phone, User Email
    - Import events validates: Slug, Title, Description, Date, Time, Category
  - **Completed:** December 3, 2025

- [x] **1.2 Fix Admin Authorization in Export/Import** ✅ COMPLETED
  - **Files:** `app/actions/export.ts`, `app/actions/import.ts`
  - **Issue:** Custom requireAdmin() only checked for ADMIN role, excluded SUPER_ADMIN
  - **Action Taken:**
    - Removed duplicate custom `requireAdmin()` functions ✓
    - Imported centralized `requireAdmin` from `lib/auth-utils.ts` ✓
    - Now properly checks for both ADMIN and SUPER_ADMIN roles ✓
  - **Additional Fixes:**
    - Updated `lib/audit.ts` to support EXPORT, IMPORT, RESTORE actions ✓
    - Added 'System' entity type for backup operations ✓
    - Fixed all logAudit calls to use correct signature (entity, entityId, changes) ✓
  - **Functions Updated:**
    - `exportBookings()`, `exportEvents()`, `exportUsers()`, `exportBackup()`
    - `importBookings()`, `importEvents()`, `restoreBackup()`
    - `validateImportData()`
  - **Completed:** December 3, 2025

- [ ] **1.3 Remove PII from Public Booking Endpoint**
  - **File:** `app/actions/bookings.ts:711-743` (`getApprovedBookings`)
  - **Issue:** Public endpoint exposes email and phone numbers (GDPR violation)
  - **Action:** Remove from select clause:
    ```typescript
    select: {
      id: true,
      title: true,
      date: true,
      time: true,
      type: true,
      guestCount: true,
      // REMOVE: email, phone
    }
    ```

- [ ] **1.4 Change Weak Default Password**
  - **File:** `.env.example:27`
  - **Issue:** `ADMIN_PASSWORD="Admin@123456"` is predictable
  - **Action:**
    ```env
    # IMPORTANT: Use a strong, unique password in production
    # Minimum 12 characters with uppercase, lowercase, numbers, and symbols
    ADMIN_PASSWORD="CHANGE_ME_TO_STRONG_PASSWORD"
    ```

- [ ] **1.5 Implement CSRF Protection**
  - **Files:** All server actions in `app/actions/`
  - **Issue:** Server actions vulnerable to CSRF attacks
  - **Action:**
    - Research NextAuth v5 CSRF token implementation
    - Add CSRF token validation to all state-changing actions
    - Implement middleware for CSRF checks
    - Test with authenticated requests

- [ ] **1.6 Add Rate Limiting to Sensitive Endpoints**
  - **Files:** `app/actions/auth.ts`, `app/actions/export.ts`
  - **Issue:** Missing rate limiting on password reset and exports
  - **Action:**
    - Add rate limiting to password reset (currently just TODO)
    - Add rate limiting to all export functions
    - Add rate limiting to user/booking creation
    - Use `strictRateLimit` for admin actions

---

## 📋 Phase 2: Performance & Security Hardening (HIGH PRIORITY)

**Priority:** 🟠 HIGH
**Timeline:** Complete within 1-2 weeks
**Estimated Time:** 6-8 hours

### ✅ Tasks

- [ ] **2.1 Fix N+1 Query in syncCustomerData**
  - **File:** `app/actions/customers.ts:333-435`
  - **Issue:** Individual queries in loop (severe performance issue)
  - **Action:** Replace with batch operations:
    ```typescript
    // Use createMany and transaction
    await prisma.user.createMany({
      data: newCustomers,
      skipDuplicates: true
    });
    await prisma.$transaction(updateQueries);
    ```

- [ ] **2.2 Optimize Dashboard Queries**
  - **File:** `app/actions/dashboard.ts:26-262`
  - **Issue:** 17+ separate database queries, multiple full table scans
  - **Action:**
    - Use aggregate queries with groupBy
    - Implement database views for common metrics
    - Add caching layer (5-15 minute TTL)
    - Consider materialized views for historical data

- [ ] **2.3 Add Missing Database Indexes**
  - **File:** `prisma/schema.prisma`
  - **Issue:** Missing composite indexes for common queries
  - **Action:** Add to schema:
    ```prisma
    model Booking {
      // ... existing fields
      @@index([userId, status])
      @@index([date, time])
      @@index([createdAt])
    }

    model Notification {
      // ... existing fields
      @@index([userId, createdAt])
      @@index([userId, read])
    }

    model AuditLog {
      // ... existing fields
      @@index([action, timestamp])
      @@index([userId, timestamp])
    }
    ```
  - **Don't forget:** Run migration after adding indexes

- [ ] **2.4 Sanitize Email HTML Templates (XSS Prevention)**
  - **File:** `lib/email.ts:104-543`
  - **Issue:** User input inserted directly into HTML
  - **Action:**
    - Install: `npm install html-escaper`
    - Import: `import { escape } from 'html-escaper'`
    - Wrap all dynamic content: `${escape(data.customerName)}`
    - Test with malicious input: `<script>alert('xss')</script>`

- [ ] **2.5 Sanitize Audit Log Data**
  - **File:** `lib/audit.ts:34`
  - **Issue:** Audit logs may store passwords and PII
  - **Action:**
    - Create sanitization function to strip sensitive fields
    - Blacklist: password, token, secret, ssn, creditCard
    - Apply before logging
    - Review existing logs for sensitive data

- [ ] **2.6 Add Missing Input Validation**
  - **Files:** Various actions
  - **Issue:** Some actions lack Zod schema validation
  - **Action:** Add schemas for:
    - `addCustomerTag` - validate tag string format
    - `updateLoyaltyPoints` - prevent negative/infinity values
    - `upsertCustomer` - strengthen email validation
    - All import functions - validate CSV data structure

---

## 📋 Phase 3: Code Quality & Maintainability (MEDIUM PRIORITY)

**Priority:** 🟡 MEDIUM
**Timeline:** Complete within 1 month
**Estimated Time:** 4-6 hours

### ✅ Tasks

- [ ] **3.1 Standardize Error Handling**
  - **Files:** All server actions
  - **Issue:** Mix of error handling patterns
  - **Action:**
    - Choose single pattern: `handleServerError` or `sanitizeErrorForClient`
    - Update all actions to use consistent pattern
    - Document error handling standard in CLAUDE.md
    - Create error handling utility if needed

- [ ] **3.2 Remove Duplicate Authorization Code**
  - **Files:** `export.ts`, `import.ts`
  - **Issue:** Custom requireAdmin instead of centralized helper
  - **Action:**
    - Remove duplicate requireAdmin functions
    - Import from `lib/auth-utils.ts` everywhere
    - Verify all admin checks include SUPER_ADMIN
    - Run tests to confirm authorization still works

- [ ] **3.3 Replace console.log with logger**
  - **File:** `lib/email.ts:36-41, 62-63, 76-77, 84-85, 92-93`
  - **Issue:** console.log bypasses centralized logging
  - **Action:**
    ```typescript
    // Replace:
    console.log('📧 [EMAIL] ...') → logger.info('EMAIL: ...')
    console.warn('⚠️  [EMAIL] ...') → logger.warn('EMAIL: ...')
    console.error('❌ [EMAIL] ...') → logger.error('EMAIL: ...')
    ```

- [ ] **3.4 Fix Unsafe Type Assertions**
  - **Files:** Multiple (`users.ts:43`, `bookings.ts:48`, `dashboard.ts:28`)
  - **Issue:** `as any` defeats TypeScript safety
  - **Action:**
    - Replace with proper type guards
    - Use Zod enums for role/type validation
    - Add runtime checks where needed
    - Enable stricter TypeScript checks

- [ ] **3.5 Extract Magic Numbers to Config**
  - **Files:** Multiple
  - **Issue:** Hardcoded business logic values
  - **Action:**
    - Create `constants/business-rules.ts`:
      ```typescript
      export const LOYALTY_TIERS = {
        BRONZE: 1000,
        SILVER: 3000,
        GOLD: 6000,
      };
      export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min
      export const RATE_LIMITS = {
        AUTH: 5,
        STANDARD: 30,
        STRICT: 3,
      };
      export const PAGINATION = {
        DEFAULT: 20,
        MAX: 50,
      };
      ```

- [ ] **3.6 Fix Hardcoded Localhost URL**
  - **File:** `lib/email.ts:392`
  - **Issue:** `http://localhost:3000` in production code
  - **Action:**
    ```typescript
    const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
    ```

---

## 📋 Phase 4: Documentation & Polish (LOW PRIORITY)

**Priority:** 🟢 LOW
**Timeline:** Ongoing / As needed
**Estimated Time:** 3-4 hours

### ✅ Tasks

- [ ] **4.1 Add JSDoc Comments**
  - **Files:** All components and utilities
  - **Issue:** Many functions lack documentation
  - **Action:**
    - Add JSDoc to all exported functions
    - Document parameters and return types
    - Add usage examples for complex functions
    - Focus on public APIs first

- [ ] **4.2 Clean Up TODO Comments**
  - **Files:** Multiple (`SchemaMarkup.tsx`, `email.ts`, `auth.ts`)
  - **Issue:** TODOs in production code
  - **Action:**
    - Create GitHub issues for all TODOs
    - Remove TODO comments from code
    - Link to issues in commit messages
    - Track in project board

- [ ] **4.3 Add Missing Environment Variables**
  - **File:** `.env.example`
  - **Issue:** `NEXT_PUBLIC_SITE_URL` missing but used in code
  - **Action:**
    - Add to .env.example with documentation
    - Document all env vars in README
    - Add validation for required vars
    - Create .env.example.complete with all options

- [ ] **4.4 Improve Accessibility**
  - **Files:** All components
  - **Issue:** May be missing alt text, ARIA labels
  - **Action:**
    - Audit all images for alt text
    - Add ARIA labels where needed
    - Test keyboard navigation
    - Run Lighthouse accessibility audit
    - Fix color contrast issues

- [ ] **4.5 Add Integration Tests for Security**
  - **Files:** New test files
  - **Issue:** No tests for security features
  - **Action:**
    - Test authentication flows
    - Test authorization checks
    - Test rate limiting
    - Test input validation
    - Test CSRF protection

---

## 📊 Progress Tracking

### Phase 1: Critical (2/6 complete) - 33% ✓
- [x] Schema Mismatch ✅
- [x] Admin Authorization ✅
- [ ] PII Exposure
- [ ] Weak Password
- [ ] CSRF Protection
- [ ] Rate Limiting

### Phase 2: High Priority (0/6 complete)
- [ ] N+1 Query
- [ ] Dashboard Queries
- [ ] Database Indexes
- [ ] Email XSS
- [ ] Audit Log Sanitization
- [ ] Input Validation

### Phase 3: Medium Priority (0/6 complete)
- [ ] Error Handling
- [ ] Duplicate Code
- [ ] Logging
- [ ] Type Safety
- [ ] Config Extraction
- [ ] Localhost URL

### Phase 4: Low Priority (0/5 complete)
- [ ] JSDoc
- [ ] TODOs
- [ ] Env Vars
- [ ] Accessibility
- [ ] Security Tests

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ No schema errors in export/import
- ✅ SUPER_ADMIN can access all admin features
- ✅ No PII exposed in public endpoints
- ✅ Strong password required in documentation
- ✅ CSRF attacks blocked
- ✅ Rate limits prevent abuse

### Phase 2 Complete When:
- ✅ Customer sync completes in < 5 seconds for 1000 customers
- ✅ Dashboard loads in < 2 seconds
- ✅ Database queries use indexes (check EXPLAIN)
- ✅ No XSS vulnerabilities in email templates
- ✅ No passwords/secrets in audit logs
- ✅ All inputs validated with Zod schemas

### Phase 3 Complete When:
- ✅ Consistent error handling across all actions
- ✅ No duplicate code for common operations
- ✅ No console.log statements (only logger)
- ✅ No `as any` type assertions
- ✅ Business rules in config files
- ✅ Environment-aware URLs

### Phase 4 Complete When:
- ✅ All public APIs documented
- ✅ No TODO comments in code
- ✅ All env vars documented
- ✅ Lighthouse accessibility score > 90
- ✅ Security test coverage > 80%

---

## 📝 Notes

### Before Starting:
1. Create a new branch: `git checkout -b code-review-fixes`
2. Run all tests: `npm test && npm run test:unit:run`
3. Backup database: `pg_dump > backup.sql`

### After Each Phase:
1. Run linter: `npm run lint`
2. Run tests: `npm test && npm run test:unit:run`
3. Test manually in browser
4. Commit changes with descriptive message
5. Update this file with completion status

### When All Complete:
1. Run full security audit
2. Performance testing
3. Create pull request
4. Code review by team
5. Deploy to staging
6. Final testing
7. Deploy to production

---

## 🔗 Related Documentation

- [Code Review Report](./CODE_REVIEW_REPORT.md) - Detailed findings
- [Security Best Practices](./docs/SECURITY.md) - Security guidelines
- [Project Status](./PROJECT_STATUS.md) - Overall project status
- [CLAUDE.md](./CLAUDE.md) - Development guidelines

---

**Last Updated:** 2025-12-03
**Next Review:** After Phase 1 completion
