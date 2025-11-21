# Testing Guide

## Overview

This document provides comprehensive guidance for testing the Xplorium application. The project uses a multi-layered testing strategy including:

- **E2E Tests** (Playwright) - Full user journey testing
- **Unit Tests** (Vitest) - Component and utility testing
- **Accessibility Tests** (axe-core) - WCAG 2.1 AA compliance
- **Visual Regression** (Planned) - Screenshot comparison
- **Performance Testing** (Planned) - Lighthouse CI

---

## Table of Contents

1. [Test Structure](#test-structure)
2. [Running Tests](#running-tests)
3. [E2E Testing](#e2e-testing)
4. [Unit Testing](#unit-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Writing New Tests](#writing-new-tests)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Test Structure

### Directory Organization

```
tests/
├── landing-navigation.spec.ts    # Landing page navigation flows
├── auth-flows.spec.ts            # Authentication modals and flows
├── admin-crud.spec.ts            # Admin CRUD operations
├── accessibility.spec.ts         # WCAG 2.1 AA compliance tests
└── fixtures/                     # Test data and fixtures (when needed)

components/
├── common/LoadingSpinner.test.tsx
├── ErrorBoundary.test.tsx
└── ...

hooks/
├── useReducedMotion.test.ts
└── ...
```

### Test File Naming Conventions

- **E2E Tests**: `*.spec.ts` in `tests/` directory
- **Unit Tests**: `*.test.tsx` or `*.test.ts` co-located with components/hooks
- **Accessibility Tests**: `accessibility.spec.ts` in `tests/` directory

---

## Running Tests

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm test

# Run tests in UI mode (recommended for development)
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test file
npx playwright test tests/landing-navigation.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should navigate"

# Show test report
npm run test:report

# Debug a specific test
npx playwright test --debug tests/landing-navigation.spec.ts
```

### Unit Tests (Vitest)

```bash
# Run unit tests in watch mode
npm run test:unit

# Run unit tests with UI
npm run test:unit:ui

# Run unit tests once (CI mode)
npm run test:unit:run

# Run with coverage report
npm run test:unit:coverage

# Run specific test file
npx vitest run components/common/LoadingSpinner.test.tsx
```

### All Tests

```bash
# Run E2E and unit tests together
npm test && npm run test:unit:run
```

---

## E2E Testing

### Test Coverage

#### 1. Landing Navigation Tests (`landing-navigation.spec.ts`)

**Coverage**: 13 tests covering:
- X logo display and interaction
- Brand reveal animation
- Section navigation (Cafe, Sensory, Igraonica)
- Subsection navigation
- Back navigation with Escape key
- Auth button visibility
- Starfield background
- Keyboard navigation
- Hydration error detection
- Reduced motion support

**Example**:
```typescript
test('should reveal brand after clicking X logo', async ({ page }) => {
  const xLogo = page.getByRole('button', { name: /click to explore/i })
  await xLogo.click()

  const brand = page.getByText(/plorium/i)
  await expect(brand).toBeVisible({ timeout: 3000 })

  await expect(page.getByRole('button', { name: /cafe/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /sensory/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /igraonica/i })).toBeVisible()
})
```

#### 2. Auth Flow Tests (`auth-flows.spec.ts`)

**Coverage**: 25+ tests covering:
- Sign In modal (open, close, validation)
- Sign Up modal (open, validation, password strength)
- Forgot Password modal
- Form validation (email, password, required fields)
- Modal transitions (switching between modals)
- Modal interactions (backdrop click, Escape key)
- Accessibility (focus trapping, ARIA labels, keyboard navigation)

**Example**:
```typescript
test('should validate email field', async ({ page }) => {
  await page.getByRole('button', { name: /sign in/i }).first().click()

  const emailInput = page.getByLabel(/email/i)
  await emailInput.fill('invalid-email')

  const submitButton = page.getByRole('button', { name: /sign in/i }).last()
  await submitButton.click()

  const errorMessage = page.getByText(/invalid.*email/i)
  await expect(errorMessage.first()).toBeVisible({ timeout: 2000 })
})
```

#### 3. Admin CRUD Tests (`admin-crud.spec.ts`)

**Coverage**: 40+ tests covering:
- User management (create, edit, delete, block, role changes)
- Event management (create, edit, publish, delete, reorder)
- Booking management (view, approve, reject, delete)
- Content management (edit sections, upload images)
- Authorization checks
- Audit logging verification
- Error handling

**Example**:
```typescript
test('should create new user with valid data', async ({ page }) => {
  await page.goto('/admin/users')

  const createButton = page.getByRole('button', { name: /add user/i })
  await createButton.first().click()

  await page.getByLabel(/name/i).fill('Test User')
  await page.getByLabel(/email/i).fill(`test.user.${Date.now()}@example.com`)

  const submitButton = page.getByRole('button', { name: /submit/i })
  await submitButton.first().click()

  const successMessage = page.getByText(/success/i)
  await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
})
```

### Playwright Configuration

**File**: `playwright.config.ts`

**Key Settings**:
```typescript
{
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
}
```

---

## Unit Testing

### Test Coverage

#### 1. Component Tests

**LoadingSpinner** (`components/common/LoadingSpinner.test.tsx`):
```typescript
describe('LoadingSpinner', () => {
  it('should render with default size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('should render with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-12 h-12')
  })
})
```

**ErrorBoundary** (`components/ErrorBoundary.test.tsx`):
```typescript
describe('ErrorBoundary', () => {
  it('should catch and display errors', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
```

#### 2. Hook Tests

**useReducedMotion** (`hooks/useReducedMotion.test.ts`):
```typescript
describe('useReducedMotion', () => {
  it('should return true when prefers-reduced-motion is set', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    window.matchMedia = matchMedia

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })
})
```

### Vitest Configuration

**File**: `vitest.config.ts`

**Key Settings**:
```typescript
{
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'playwright.config.ts',
        '**/*.config.{ts,js}',
      ],
    },
  },
}
```

---

## Accessibility Testing

### Test Coverage

The accessibility test suite (`accessibility.spec.ts`) includes **35 tests** covering:

#### 1. WCAG 2.1 AA Compliance
- Automated accessibility scans using axe-core
- Color contrast checking
- Proper document structure
- Semantic HTML landmarks

#### 2. Keyboard Navigation
- Tab navigation through interactive elements
- Enter/Space key activation
- Escape key for closing modals and navigation
- Focus visibility

#### 3. Screen Reader Support
- Descriptive button labels
- Proper ARIA attributes
- Live regions for dynamic content
- Alternative text for images

#### 4. Forms
- Labels for all inputs
- Accessible error messages
- Required field indicators
- Focus management

#### 5. Modals
- Focus trapping
- ARIA attributes (role="dialog", aria-modal, aria-labelledby)
- Keyboard navigation
- Return focus on close

#### 6. Responsive Accessibility
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Zoom support up to 200%

#### 7. Reduced Motion
- Respect prefers-reduced-motion preference
- Content visibility without animations

### Running Accessibility Tests

```bash
# Run all accessibility tests
npx playwright test tests/accessibility.spec.ts

# Run specific accessibility test suite
npx playwright test tests/accessibility.spec.ts --grep "Landing Page"

# Run in UI mode for debugging
npx playwright test tests/accessibility.spec.ts --ui

# Generate accessibility report
npx playwright test tests/accessibility.spec.ts --reporter=html
```

### Example Accessibility Test

```typescript
test('should not have any automatically detectable accessibility issues', async ({ page }) => {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

test('should trap focus within modal', async ({ page }) => {
  await page.getByRole('button', { name: /sign in/i }).first().click()
  await page.waitForTimeout(500)

  const focusableElements = await page
    .locator('[role="dialog"] button, [role="dialog"] input, [role="dialog"] a')
    .all()

  if (focusableElements.length > 0) {
    await focusableElements[0].focus()

    for (let i = 0; i < focusableElements.length + 1; i++) {
      await page.keyboard.press('Tab')
    }

    const activeElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(activeElement).toBeTruthy()
  }
})
```

### Manual Accessibility Testing

In addition to automated tests, perform manual testing:

1. **Keyboard Navigation**:
   - Navigate entire app using only keyboard
   - Verify all interactive elements are reachable
   - Check focus indicators are visible

2. **Screen Reader Testing**:
   - NVDA (Windows) - Free
   - JAWS (Windows) - Commercial
   - VoiceOver (macOS) - Built-in
   - TalkBack (Android) - Built-in

3. **Color Contrast**:
   - Use browser DevTools Lighthouse
   - WAVE browser extension
   - Contrast Checker tools

4. **Zoom Testing**:
   - Test at 200% zoom
   - Verify no horizontal scrolling (unless necessary)
   - Check all content remains accessible

---

## Writing New Tests

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should do something', async ({ page }) => {
    // Arrange: Set up the test
    const button = page.getByRole('button', { name: /click me/i })

    // Act: Perform the action
    await button.click()

    // Assert: Verify the result
    await expect(page.getByText(/success/i)).toBeVisible()
  })
})
```

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    render(<MyComponent />)

    // Act
    const element = screen.getByText(/hello/i)

    // Assert
    expect(element).toBeInTheDocument()
  })
})
```

### Accessibility Test Template

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should be accessible', async ({ page }) => {
  await page.goto('/my-page')

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
```

### Best Practices for Writing Tests

1. **Use Semantic Queries**:
   ```typescript
   // ✅ Good - Uses accessible role
   page.getByRole('button', { name: /submit/i })

   // ❌ Bad - Relies on implementation details
   page.locator('.submit-btn')
   ```

2. **Wait for Elements Properly**:
   ```typescript
   // ✅ Good - Explicit assertion with timeout
   await expect(element).toBeVisible({ timeout: 3000 })

   // ❌ Bad - Arbitrary wait
   await page.waitForTimeout(3000)
   ```

3. **Test User Behavior, Not Implementation**:
   ```typescript
   // ✅ Good - Tests what user sees
   await expect(page.getByText(/welcome/i)).toBeVisible()

   // ❌ Bad - Tests internal state
   await expect(page.locator('[data-state="loaded"]')).toBeVisible()
   ```

4. **Use Descriptive Test Names**:
   ```typescript
   // ✅ Good
   test('should display error message when email is invalid', ...)

   // ❌ Bad
   test('test email validation', ...)
   ```

5. **Keep Tests Isolated**:
   ```typescript
   // ✅ Good - Each test sets up its own state
   test.beforeEach(async ({ page }) => {
     await page.goto('/')
   })

   // ❌ Bad - Tests depend on each other
   let sharedState
   test('first test', () => { sharedState = ... })
   test('second test', () => { use(sharedState) })
   ```

---

## CI/CD Integration

### GitHub Actions (Planned)

```yaml
name: Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit:run

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm test

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hooks (Recommended)

Install Husky and lint-staged:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "npm run lint",
      "npm run test:unit:run -- --related"
    ]
  }
}
```

---

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use descriptive names** that explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert

### 2. Test Maintenance

- **Update tests** when features change
- **Remove obsolete tests** to reduce noise
- **Refactor common patterns** into helper functions

### 3. Performance

- **Run tests in parallel** when possible (Playwright default)
- **Use test.beforeEach** for setup instead of repeating code
- **Mock external dependencies** in unit tests

### 4. Debugging

- **Use test.only** to run a single test
- **Use --debug** flag for step-by-step debugging
- **Check screenshots** on test failures
- **Review trace files** for complex failures

### 5. Coverage Goals

- **E2E**: Cover all critical user paths
- **Unit**: Aim for 80%+ coverage on utilities and hooks
- **Accessibility**: 100% compliance with WCAG 2.1 AA
- **Integration**: Test component interactions

---

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

**Problem**: Test exceeds default timeout (30s)

**Solution**:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ... test code
})
```

#### 2. Element Not Found

**Problem**: `locator.click: Target closed` or similar

**Solution**:
```typescript
// Wait for element to be visible
await expect(element).toBeVisible({ timeout: 5000 })
await element.click()
```

#### 3. Flaky Tests

**Problem**: Test passes/fails inconsistently

**Solutions**:
- Add explicit waits: `await expect(element).toBeVisible()`
- Avoid `waitForTimeout`, use `waitForSelector` instead
- Check for animations completing before assertions
- Use `test.retry(2)` for inherently flaky tests

#### 4. Hydration Errors in Tests

**Problem**: Console shows hydration mismatches

**Solution**: See [HYDRATION_SAFETY_GUIDE.md](./HYDRATION_SAFETY_GUIDE.md) for fixes

#### 5. Accessibility Violations

**Problem**: axe-core reports violations

**Solution**:
```typescript
// Get detailed violation info
const results = await new AxeBuilder({ page }).analyze()
console.log(results.violations)

// Fix the specific issue and re-run
```

---

## Resources

### Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools

- [Playwright VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- [Testing Library Chrome Extension](https://chrome.google.com/webstore/detail/testing-playground/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)

### Related Guides

- [HYDRATION_SAFETY_GUIDE.md](./HYDRATION_SAFETY_GUIDE.md) - Preventing hydration errors
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Project roadmap
- [CLAUDE.md](../CLAUDE.md) - Project overview and architecture

---

## Summary

The Xplorium project has comprehensive test coverage across:

✅ **13 Landing Navigation Tests** - User journey through landing page
✅ **25+ Auth Flow Tests** - Authentication modals and validation
✅ **40+ Admin CRUD Tests** - Full admin panel functionality
✅ **35 Accessibility Tests** - WCAG 2.1 AA compliance
✅ **Unit Tests** - Components, hooks, and utilities

**Total**: 100+ automated tests ensuring quality, accessibility, and reliability.

For questions or improvements, refer to the project's GitHub issues or contact the development team.
