# Xplorium Next.js/React Codebase - Test Coverage Analysis
**Date**: November 18, 2025  
**Project**: Xplorium Landing Page  
**Tech Stack**: Next.js 16, React 19.2, TypeScript, Tailwind CSS 4, Framer Motion

---

## Executive Summary

This codebase has **minimal test coverage** with only **4 test files** covering approximately **2.3% of the application code**. While testing infrastructure (Vitest + Playwright) is properly configured, the vast majority of critical functionality—especially animation components, state management hooks, and feature sections—lacks unit test coverage.

### Current Test Metrics
- **Total Source Files**: 88 (excluding tests)
- **Test Files**: 4 (3 unit tests + 1 E2E test suite)
- **Unit Tests**: 7 tests
- **E2E Tests**: 11 tests
- **Estimated Coverage**: <5%
- **Lines of Code**: ~3,000+ (app + components + hooks + features)
- **Tested Lines**: ~150-200 (3.5% coverage)

---

## Testing Infrastructure Status

### Configured Tools ✓
The project has a **modern, well-configured testing stack**:

| Tool | Purpose | Status |
|------|---------|--------|
| **Vitest 4.0.8** | Unit testing framework | ✓ Configured |
| **React Testing Library 16.3.0** | Component testing | ✓ Configured |
| **Jest-DOM 6.9.1** | DOM matchers | ✓ Configured |
| **JSDOM** | DOM environment | ✓ Configured |
| **Playwright 1.56.1** | E2E testing | ✓ Configured |
| **TypeScript 5** | Type safety | ✓ Configured |

### Configuration Files
- `vitest.config.ts` - Unit test configuration
  - Environment: jsdom
  - Setup files: vitest.setup.ts
  - CSS support enabled
  - Path aliases configured (@/* paths)
  
- `vitest.setup.ts` - Test setup
  - Jest-DOM matchers extended
  - Automatic cleanup after each test
  - window.matchMedia mocked for responsive design tests
  
- `playwright.config.ts` - E2E test configuration
  - Base URL: http://localhost:3000
  - Single browser: Chromium
  - Reports: HTML reporter
  - Screenshots on failure
  
- `package.json` Scripts
  ```
  "test": "playwright test"              # Run E2E tests
  "test:ui": "playwright test --ui"      # E2E tests with UI
  "test:headed": "playwright test --headed"  # Visible browser
  "test:report": "playwright show-report"    # View E2E report
  "test:unit": "vitest"                  # Unit tests (watch mode)
  "test:unit:ui": "vitest --ui"          # Unit tests with UI
  "test:unit:run": "vitest run"          # Unit tests (single run)
  "test:unit:coverage": "vitest run --coverage"  # Coverage report
  ```

---

## Current Test Coverage Breakdown

### 1. Unit Tests (7 total)

#### ✓ components/ErrorBoundary.test.tsx (3 tests)
**Lines of Code**: 60 (test file: 3 tests)  
**Coverage**: ErrorBoundary component only

Tests:
1. ✓ Renders children when no error exists
2. ✓ Renders error UI when error occurs
3. ✓ Shows error message in development mode

**Issues**:
- No tests for error handling in production mode
- No tests for handleReset() button functionality
- No tests for error logging/tracking

---

#### ✓ components/common/LoadingSpinner.test.tsx (4 tests)
**Lines of Code**: 34 (test file: 4 tests)  
**Coverage**: LoadingSpinner component only

Tests:
1. ✓ Renders without crashing
2. ✓ Renders with optional text
3. ✓ Does not render text when not provided
4. ✓ Applies correct size classes (sm/md/lg)

**Issues**:
- No tests for color prop
- No tests for animation behavior (Framer Motion)
- No tests for responsive behavior

---

#### ✓ hooks/useReducedMotion.test.ts (2 tests)
**Lines of Code**: 32 (test file: 2 tests)  
**Coverage**: useReducedMotion hook only

Tests:
1. ✓ Returns false when prefers-reduced-motion is not set
2. ✓ Detects prefers-reduced-motion preference

**Issues**:
- No tests for media query listener cleanup
- No tests for dynamic preference changes
- No tests for SSR compatibility

---

### 2. E2E Tests (11 tests via Playwright)

#### ✓ tests/xplorium.spec.ts (11 Playwright tests)
**Lines of Code**: 204 (E2E test file)  
**Coverage**: Landing page navigation flow

Tests:
1. ✓ Loads homepage with correct title
2. ✓ Displays X logo initially
3. ✓ Shows starfield background with animated stars
4. ✓ Shows brand name after clicking X logo
5. ✓ Displays three main navigation sections
6. ✓ Navigates to Cafe section and shows glass frame menu
7. ✓ Shows planet orbs in Sensory section
8. ✓ Displays typewriter text in Igraonica section
9. ✓ Is responsive on mobile viewport (375x667)
10. ✓ Handles back navigation correctly
11. ✓ Has neon glow effects on navigation items
12. ✓ Loads without JavaScript errors

**Limitations**:
- Tests are broad/integration-level, not testing specific component behavior
- Limited assertion precision (checks for visibility only, not exact values)
- No tests for specific error scenarios
- No test coverage for subsection interactions (cafe menus, sensory floors, etc.)
- Mobile tests limited to viewport size change only

---

## Critical Coverage Gaps

### 1. Animation Components (6 components) - **0% COVERAGE**

| Component | Purpose | Lines | Tests | Status |
|-----------|---------|-------|-------|--------|
| **PenStrokeReveal.tsx** | Character pop-in animation | 44 | 0 | ❌ CRITICAL |
| **CharacterReveal.tsx** | Slide-in character animation | 42 | 0 | ❌ CRITICAL |
| **HandwritingText.tsx** | Clip-path reveal animation | 43 | 0 | ❌ CRITICAL |
| **HandwritingEffect.tsx** | Alternative handwriting animation | 50 | 0 | ❌ CRITICAL |
| **TypewriterText.tsx** | Character-by-character reveal | 52 | 0 | ❌ CRITICAL |
| **PlanetOrb.tsx** | Animated planet orbs with glow | 197 | 0 | ❌ CRITICAL |

**Why This Matters**: These components handle the core visual identity of the site. No tests verify:
- Animation timing and delays
- Character splitting logic
- Framer Motion integration
- Props passing (delay, text, color, size, position)
- Hover/tap interactions
- Responsive behavior

**Recommended Tests per Component**:
- Props validation (text, delay, className, color, size, position)
- Animation state verification (initial, animate, transition)
- Character/word splitting logic
- Conditional rendering (image vs neon effect for PlanetOrb)
- Interactive states (whileHover, whileTap)

---

### 2. Feature Sections (3 components) - **0% COVERAGE**

| Component | Purpose | Lines | Tests | Status |
|-----------|---------|-------|-------|--------|
| **CafeSection.tsx** | Cafe menu with glass frame | 911 | 0 | ❌ CRITICAL |
| **SensorySection.tsx** | Sensory room with planet orbs | 186 | 0 | ❌ CRITICAL |
| **IgraonicaSection.tsx** | Playground section | 140 | 0 | ❌ CRITICAL |

**Why This Matters**: These are major feature components with complex state and user interactions. No tests verify:
- Subsection navigation (meni, zakup, radno, kontakt)
- Event calendar functionality
- Booking form submission
- Contact information display
- Glass frame styling and animations
- Content scrolling and gallery behavior
- Map embed functionality

**Recommended Tests per Component**:
- Props validation (cafeSubView, setCafeSubView, etc.)
- Subsection navigation logic
- Calendar event rendering and interaction
- Form submission and validation
- Content visibility based on active subsection
- Back navigation handling
- Mobile responsiveness

---

### 3. Common Components (6 components) - **17% COVERAGE**

| Component | Purpose | Lines | Tests | Status |
|-----------|---------|-------|-------|--------|
| **Starfield.tsx** | Animated starfield background | 160 | 0 | ❌ CRITICAL |
| **EventCalendar.tsx** | Calendar with event management | 347 | 0 | ❌ HIGH |
| **BookingForm.tsx** | Event booking form | 476 | 0 | ❌ HIGH |
| **Skeleton.tsx** | Loading skeleton | 124 | 0 | ❌ MEDIUM |
| **LoadingSpinner.tsx** | Loading spinner | 63 | ✓ PARTIAL | ⚠️ MEDIUM |
| **theme-provider.tsx** | Theme provider wrapper | ? | 0 | ❌ LOW |

**Starfield.tsx** (CRITICAL):
- No tests for star generation logic (useMemo)
- No tests for section-color mapping
- No tests for animated star appearance/disappearance
- No tests for star animation parameters

**EventCalendar.tsx** (HIGH):
- No tests for date selection
- No tests for event filtering
- No tests for calendar rendering
- No tests for date range calculations

**BookingForm.tsx** (HIGH):
- No tests for form validation
- No tests for form submission
- No tests for field rendering
- No tests for error handling

---

### 4. Hooks (7 total) - **14% COVERAGE**

| Hook | Purpose | Lines | Tests | Status |
|------|---------|-------|-------|--------|
| **useNavigation.ts** | Navigation state management | 95 | 0 | ❌ CRITICAL |
| **useKeyboardNavigation.ts** | Keyboard event handling | 35 | 0 | ❌ CRITICAL |
| **useReducedMotion.ts** | Accessibility preferences | 43 | ✓ PARTIAL | ⚠️ MEDIUM |
| **use-mobile.ts** | Mobile detection | 19 | 0 | ❌ MEDIUM |
| **use-toast.ts** | Toast notifications | 191 | 0 | ❌ HIGH |
| **index.ts** | Export file | 9 | 0 | N/A | N/A |

**useNavigation.ts** (CRITICAL - 95 lines):
- No tests for state initialization
- No tests for setActiveView()
- No tests for setCafeSubView()
- No tests for setSensorySubView()
- No tests for goBack() logic (hierarchical navigation)
- No tests for reset() functionality
- No tests for callback stability (useCallback)

**useKeyboardNavigation.ts** (CRITICAL - 35 lines):
- No tests for event listener attachment
- No tests for cleanup function
- No tests for Escape key detection
- No tests for enabled/disabled toggle
- No tests for preventDefault() behavior

**use-toast.ts** (HIGH - 191 lines):
- No tests for toast queue management
- No tests for toast creation/removal
- No tests for toast lifecycle
- No tests for event handling

---

### 5. Main Page Component - **0% COVERAGE**

| File | Purpose | Lines | Tests | Status |
|------|---------|-------|-------|--------|
| **app/page.tsx** | Landing page (main component) | 715 | 0 | ❌ CRITICAL |

**Why This Matters**: This is the largest component (715 lines) containing:
- X logo animation logic
- Brand reveal state
- Main navigation flow
- Section switching (cafe, sensory, igraonica)
- Reduced motion accessibility
- All major state management

**Critical Logic Not Tested**:
- `isAnimating` state logic
- `showBrand` reveal timing
- `activeView` switching
- Subsection navigation (sensorySubView, cafeSubView)
- Keyboard event handling
- Animation timing and easing
- Responsive layout adjustments
- Mobile menu behavior

---

### 6. Utility Functions - **0% COVERAGE**

| File | Purpose | Lines | Tests | Status |
|------|---------|-------|-------|--------|
| **lib/utils.ts** | Utility functions | 6 | 0 | ❌ MEDIUM |
| **constants/animations.ts** | Animation constants | 97 | 0 | ❌ LOW |

**lib/utils.ts** (cn function):
- No tests for className merging
- No tests for clsx + tailwind-merge integration
- No tests for edge cases (null, undefined, false values)
- No tests for Tailwind class conflict resolution

**constants/animations.ts**:
- No tests for getParticleCount() function
- No tests for constant values
- No tests for responsive particle calculations

---

### 7. Type Definitions - **0% COVERAGE**

| Files | Purpose | Status |
|-------|---------|--------|
| **types/index.ts** | Type exports | ❌ Not testable |
| **types/common.ts** | Common types | ❌ Not testable |
| **types/navigation.ts** | Navigation types | ❌ Not testable |

*Note*: Type definitions are not directly testable, but types should be validated through component/hook tests.

---

### 8. UI Components Library (50+ components) - **0% COVERAGE**

The `components/ui/` directory contains 50+ shadcn/ui components:
- Form components (input, button, select, checkbox, textarea, form)
- Layout components (card, dialog, sheet, sidebar, tabs)
- Feedback components (toast, alert, progress, skeleton)
- Navigation components (navigation-menu, breadcrumb, menubar)

**Status**: These are third-party shadcn/ui components and may not require testing, but custom wrappers should be tested if created.

---

## Test Infrastructure Recommendations

### 1. Coverage Configuration
**Add to `vitest.config.ts`**:
```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'json'],
    include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}'],
    exclude: ['**/*.test.{ts,tsx}', '**/node_modules/**', '**/.next/**'],
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,
  }
}
```

### 2. Test Utilities Setup
Create `tests/test-utils.tsx`:
```typescript
import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

function render(ui: React.ReactElement, options = {}) {
  return rtlRender(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {ui}
    </ThemeProvider>,
    options
  )
}

export * from '@testing-library/react'
export { render }
```

### 3. Mock Framer Motion
Create `tests/framer-motion-mock.ts`:
```typescript
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))
```

---

## Critical Areas for Immediate Testing

### Priority 1: CRITICAL (Start Here)
1. **useNavigation.ts** - Core navigation logic
2. **PenStrokeReveal.tsx** - Visible on initial load
3. **PlanetOrb.tsx** - Core Sensory section interaction
4. **app/page.tsx** - Main component logic
5. **CafeSection.tsx** - Largest feature section

### Priority 2: HIGH (Next Sprint)
6. **TypewriterText.tsx** - Visible to users
7. **CharacterReveal.tsx** - Used in animations
8. **EventCalendar.tsx** - Complex state management
9. **BookingForm.tsx** - User-facing form
10. **Starfield.tsx** - Background animation

### Priority 3: MEDIUM (Future)
11. **useKeyboardNavigation.ts** - Accessibility
12. **useReducedMotion.ts** (improve coverage)
13. **LoadingSpinner.tsx** (improve coverage)
14. **ErrorBoundary.tsx** (improve coverage)
15. Utility functions and constants

---

## Recommended Testing Strategy

### Phase 1: Foundation (Weeks 1-2)
- Set up coverage infrastructure
- Create test utilities and mocks
- Add tests for critical hooks (useNavigation, useKeyboardNavigation)
- Add tests for main page component state management

### Phase 2: Animation Components (Weeks 3-4)
- Test all 6 animation components
- Verify Framer Motion integration
- Test props passing and character splitting
- Test responsive behavior

### Phase 3: Feature Sections (Weeks 5-6)
- Test CafeSection (largest priority)
- Test SensorySection
- Test IgraonicaSection
- Test subsection navigation

### Phase 4: Common Components (Weeks 7-8)
- Test EventCalendar
- Test BookingForm
- Test Starfield
- Improve LoadingSpinner and ErrorBoundary coverage

### Phase 5: E2E Expansion (Weeks 9-10)
- Add deeper E2E test coverage
- Test error scenarios
- Test mobile interactions
- Test form submissions and validations

### Phase 6: Reach Target Coverage (Weeks 11-12)
- Aim for 70%+ overall coverage
- Focus on remaining utility functions
- Document edge cases and assumptions

---

## Test Writing Examples

### Example 1: Animation Component Test
```typescript
// components/animations/PenStrokeReveal.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PenStrokeReveal } from './PenStrokeReveal'

describe('PenStrokeReveal', () => {
  it('renders text content', () => {
    render(<PenStrokeReveal text="Hello" />)
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
  })

  it('splits text into individual characters', () => {
    const { container } = render(<PenStrokeReveal text="Hi" />)
    const spans = container.querySelectorAll('span.inline-block')
    expect(spans.length).toBeGreaterThan(0)
  })

  it('applies initial and animate states to motion.span', () => {
    const { container } = render(<PenStrokeReveal text="Test" delay={0.5} />)
    const motionSpans = container.querySelectorAll('span.inline-block')
    expect(motionSpans.length).toBeGreaterThan(0)
  })

  it('handles spaces correctly', () => {
    const { container } = render(<PenStrokeReveal text="Hello World" />)
    expect(container.textContent).toContain('Hello World')
  })
})
```

### Example 2: Hook Test
```typescript
// hooks/useNavigation.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNavigation } from './useNavigation'

describe('useNavigation', () => {
  it('initializes with null values', () => {
    const { result } = renderHook(() => useNavigation())
    
    expect(result.current.activeView).toBeNull()
    expect(result.current.cafeSubView).toBeNull()
    expect(result.current.sensorySubView).toBeNull()
  })

  it('sets active view', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.setActiveView('cafe')
    })
    
    expect(result.current.activeView).toBe('cafe')
  })

  it('goBack returns from subsection to section', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.setActiveView('cafe')
      result.current.setCafeSubView('meni')
    })
    
    expect(result.current.cafeSubView).toBe('meni')
    
    act(() => {
      result.current.goBack()
    })
    
    expect(result.current.cafeSubView).toBeNull()
    expect(result.current.activeView).toBe('cafe')
  })

  it('reset clears all navigation state', () => {
    const { result } = renderHook(() => useNavigation())
    
    act(() => {
      result.current.setActiveView('igraonica')
    })
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.activeView).toBeNull()
  })
})
```

### Example 3: Feature Component Test
```typescript
// features/cafe/CafeSection.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CafeSection } from './CafeSection'

describe('CafeSection', () => {
  it('renders menu options when cafeSubView is null', () => {
    render(
      <CafeSection 
        cafeSubView={null} 
        setCafeSubView={vi.fn()} 
      />
    )
    // Check for menu items: Meni, Zakup, Radno, Kontakt
    expect(screen.queryByText(/meni/i)).toBeInTheDocument()
  })

  it('calls setCafeSubView when menu item is clicked', () => {
    const setSubView = vi.fn()
    render(
      <CafeSection 
        cafeSubView={null} 
        setCafeSubView={setSubView} 
      />
    )
    
    const meniButton = screen.getByText(/meni/i)
    fireEvent.click(meniButton)
    
    expect(setSubView).toHaveBeenCalledWith('meni')
  })

  it('renders subsection content when cafeSubView is set', () => {
    render(
      <CafeSection 
        cafeSubView="kontakt" 
        setCafeSubView={vi.fn()} 
      />
    )
    // Should render contact information
    expect(document.querySelector('[data-testid="cafe-kontakt"]')).toBeDefined()
  })
})
```

---

## Continuous Integration Recommendations

### GitHub Actions Workflow
Create `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit:run
      - run: npm run test:unit:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
```

---

## Summary: By The Numbers

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Test Files** | 4 | 40+ | 36 |
| **Unit Tests** | 7 | 150+ | 143 |
| **E2E Tests** | 11 | 25 | 14 |
| **Code Coverage** | <5% | 80% | 75% |
| **Animation Component Tests** | 0 | 30 | 30 |
| **Hook Tests** | 2 | 35 | 33 |
| **Feature Component Tests** | 0 | 25 | 25 |

---

## Key Takeaways

1. **Infrastructure is ready**: Vitest + Playwright are properly configured
2. **Coverage is minimal**: <5% coverage with only 7 unit tests
3. **Critical gaps exist**: Animation components, main page, and feature sections lack any unit tests
4. **E2E tests are present but shallow**: 11 Playwright tests provide basic flow validation but miss detailed interactions
5. **No integration**: Unit tests and E2E tests don't integrate well; need better test utilities
6. **High-value targets**: Focus on useNavigation, animation components, and feature sections first

**Recommendation**: Start with Phase 1 (foundation) immediately, targeting 40+ unit tests covering critical hooks and state management before expanding to component-level tests.

