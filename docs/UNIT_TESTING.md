# Unit Testing Guide

This document describes the unit testing setup and coverage for the Xplorium project.

## Overview

Unit tests are written using:
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **jsdom** - Browser environment simulation

## Running Tests

```bash
# Run all unit tests in watch mode
npm run test:unit

# Run tests once (CI mode)
npm run test:unit:run

# Run tests with UI
npm run test:unit:ui

# Run tests with coverage report
npm run test:unit:coverage
```

## Test Coverage

**Current Coverage: 64.68%** (Target: 60%) ✅

| Category | Coverage |
|----------|----------|
| Statements | 64.68% |
| Branches | 48.29% |
| Functions | 65.38% |
| Lines | 63.03% |

### Detailed Coverage by File

#### Utilities (lib/)
- ✅ **validation.ts** - 100% coverage
  - Password validation (8-128 chars, uppercase, lowercase, number, special char)
  - Email validation (RFC 5322 compliant)
  - Input sanitization (XSS prevention)
  - Full name validation

- ✅ **utils.ts** - 100% coverage
  - `cn()` className merging utility (clsx + tailwind-merge)

- ✅ **auth-utils.ts** - 100% coverage
  - Role-based authorization checks
  - Session management
  - Resource ownership verification

- ⚠️ **email.ts** - 25.64% coverage
  - Core email sending logic tested
  - Email template validation tested
  - HTML escaping tested
  - Template rendering not fully tested (would require email service)

- ⚠️ **logger.ts** - 31.91% coverage
  - Core logging methods tested
  - Environment detection tested
  - Specialized logging methods tested

#### Components
- ✅ **LoadingSpinner.tsx** - 100% coverage
  - Renders correctly
  - Text rendering
  - Size variations

- ⚠️ **ErrorBoundary.tsx** - 69.23% coverage
  - Error catching and display tested
  - Reset functionality tested

#### Hooks
- ⚠️ **useReducedMotion.ts** - 84.61% coverage
  - Media query detection tested
  - State updates tested

## Test Files

### Utility Tests
- `lib/validation.test.ts` - 25 tests
  - Password validation edge cases
  - Email format validation
  - Input sanitization and XSS prevention
  - Full name validation

- `lib/utils.test.ts` - 12 tests
  - className merging
  - Conditional classes
  - Tailwind class conflict resolution

- `lib/auth-utils.test.ts` - 26 tests
  - Role checking (requireRole, requireAdmin, requireSuperAdmin)
  - Boolean role checks (hasRole, isAdmin)
  - Session management
  - Resource ownership verification

- `lib/email.test.ts` - 16 tests
  - Email sending in development mode
  - Single/multiple recipients
  - Template data structure validation

- `lib/logger.test.ts` - 9 tests (pre-existing)
  - Environment-aware logging
  - Specialized logging methods

### Component Tests
- `components/ErrorBoundary.test.tsx` - 3 tests
  - Normal rendering
  - Error state rendering
  - Error UI elements

- `components/common/LoadingSpinner.test.tsx` - 4 tests
  - Basic rendering
  - Text rendering
  - Size variations

### Hook Tests
- `hooks/useReducedMotion.test.ts` - 2 tests (pre-existing)
  - Motion preference detection
  - State updates

## Test Configuration

### vitest.config.ts
```typescript
{
  environment: 'jsdom',
  setupFiles: './vitest.setup.ts',
  globals: true,
  css: true,
  exclude: [
    '**/node_modules/**',
    '**/tests/**',  // Playwright E2E tests
    // ...other exclusions
  ]
}
```

### vitest.setup.ts
- Imports @testing-library/jest-dom for extended matchers
- Provides `toBeInTheDocument()`, `toHaveClass()`, etc.

## Testing Best Practices

### 1. Test Organization
- Co-locate test files with source files: `Component.tsx` → `Component.test.tsx`
- Use descriptive test names
- Group related tests with `describe()` blocks

### 2. Mock External Dependencies
```typescript
// Mock external services
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: vi.fn() } }))
}))

// Mock internal modules
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() }
}))
```

### 3. Test Structure (AAA Pattern)
```typescript
it('should validate password', () => {
  // Arrange
  const password = 'Valid123!'

  // Act
  const result = validatePassword(password)

  // Assert
  expect(result).toBeNull()
})
```

### 4. Component Testing
```typescript
it('renders with props', () => {
  render(<Component text="Hello" />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### 5. Testing Async Functions
```typescript
it('handles async operations', async () => {
  const result = await asyncFunction()
  expect(result.success).toBe(true)
})
```

## What's NOT Tested

The following are intentionally excluded from unit tests:
- **Server Actions** (`app/actions/*.ts`) - Require database and full Next.js context
- **API Routes** (`app/api/**/*.ts`) - Require Next.js runtime
- **React Server Components** - Require Next.js rendering context
- **Middleware** - Requires Next.js request/response context
- **E2E Flows** - Covered by Playwright tests in `tests/` directory

## Adding New Tests

1. Create a test file next to the source file:
   ```
   lib/myUtil.ts
   lib/myUtil.test.ts
   ```

2. Import from vitest and testing library:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   ```

3. Write tests using describe/it blocks:
   ```typescript
   describe('MyUtil', () => {
     it('should do something', () => {
       expect(myUtil()).toBe('expected')
     })
   })
   ```

4. Run tests:
   ```bash
   npm run test:unit
   ```

## CI/CD Integration

Tests are automatically run on:
- Pre-commit (via git hooks)
- Pull requests (via GitHub Actions)
- Deployment pipeline (via Vercel)

## Coverage Goals

- ✅ **60% minimum** - Required for all PRs
- 🎯 **80% target** - Recommended for production code
- 🏆 **100% ideal** - For critical utilities (validation, auth, security)

## Troubleshooting

### Tests failing with module errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Coverage not updating
```bash
# Delete coverage directory
rm -rf coverage
npm run test:unit:coverage
```

### Playwright tests running in Vitest
Check `vitest.config.ts` excludes the `tests/` directory.

---

**Status:** ✅ Complete (64.68% coverage achieved)
**Last Updated:** 2025-12-07
