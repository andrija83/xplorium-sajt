# Xplorium - Complete Implementation Roadmap

**Based on Architecture & QA Reviews**
**Total Estimated Time: 6-8 weeks**
**Priority: Critical → High → Medium → Low**

---

## ✅ COMPLETED

### Phase 0: Code Review Fixes (DONE)
- ✅ Created `constants/animations.ts`
- ✅ Fixed Math.random() hydration in starburst
- ✅ Removed broken SVG filter reference
- ✅ Added `will-change` performance hints
- ✅ Added reduced motion support
- ✅ Added ARIA label to X logo
- ✅ Extracted static style objects
- ✅ Fixed setTimeout race condition

---

## 🔴 PHASE 1: CRITICAL FIXES (Week 1)

**Goal**: Fix production-blocking issues
**Time Estimate**: 2-3 days
**Risk**: Low (isolated changes)

### Task 1.1: Fix Liquid Drip Hydration ⚠️ IN PROGRESS
**File**: `app/page.tsx` lines 1077-1118
**Issue**: `Math.random()` in render causes hydration mismatch

**Implementation**:
```typescript
// Add after starburstParticles useMemo (around line 715)
const liquidDripConfig = useMemo(() => {
  return {
    count: ANIMATION_TIMING.LIQUID_MORPH_DRIP_COUNT,
    drips: Array.from({ length: ANIMATION_TIMING.LIQUID_MORPH_DRIP_COUNT }, (_, i) => ({
      id: i,
      xOffset: (Math.random() - 0.5) * 40,
      colorIndex: i % 3,
    }))
  }
}, [])

// Then in render (line 1077):
{liquidDripConfig.drips.map((drip, dripIndex) => {
  const dripColor = PARTICLE_COLORS.LIQUID_DRIP[drip.colorIndex]

  return (
    <motion.div
      key={`drip-${index}-${dripIndex}`}
      className={`absolute ${dripColor} rounded-full blur-sm pointer-events-none`}
      style={{
        left: "50%",
        top: "0%",
        width: `${4 + (dripIndex * 2)}px`,  // Deterministic size
        height: `${8 + (dripIndex * 3)}px`,
      }}
      initial={{
        x: drip.xOffset,
        y: -30,
        opacity: 0,
        scaleY: 0.5,
      }}
      // ... rest stays same
    />
  )
})}
```

---

### Task 1.2: Add Complete ARIA Labels
**Files**: `app/page.tsx` multiple locations
**Issue**: Missing screen reader labels on interactive elements

**Locations to Fix**:

1. **Planet Orbs** (line 1905):
```typescript
<PlanetOrb
  key={planet.section}
  label={planet.label}
  color={planet.color}
  size={planet.size}
  position={planet.position}
  delay={0.3 + index * 0.2}
  onClick={() => setSensorySubView(planet.section)}
  image={(planet as any).image}
  aria-label={`Navigate to ${planet.label} sensory experience`}  // ADD
  role="button"  // ADD
/>
```

2. **Cafe Menu Buttons** (line 1262):
```typescript
<motion.button
  onClick={() => setCafeSubView(item.section)}
  aria-label={`Navigate to ${item.label} section`}  // ADD
  role="button"  // ADD
  // ... existing code
>
```

3. **Main Navigation Tabs** (line 954):
```typescript
<PenStrokeReveal
  text={tab.label}
  delay={0.3 + index * 0.20}
  aria-label={`Navigate to ${tab.label} section`}  // ADD (pass through component)
/>
```

4. **Back Button** (line 842):
```typescript
<motion.button
  onClick={handleBack}
  aria-label="Go back to previous menu"  // ADD
  // ... existing code
>
```

---

### Task 1.3: Add Keyboard Navigation
**Files**: `app/page.tsx` multiple locations
**Issue**: No keyboard support, WCAG 2.1 failure

**Implementation Pattern**:
```typescript
const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    action()
  }
}

// Apply to all interactive elements:
<motion.button
  onClick={() => setCafeSubView("meni")}
  onKeyDown={(e) => handleKeyDown(e, () => setCafeSubView("meni"))}
  tabIndex={0}
  aria-label="Navigate to Menu"
>
```

**Add to**:
- X Logo button (line 867)
- Navigation tabs (line 954)
- Cafe menu items (line 1262)
- Planet orbs (line 1905)
- Back button (line 842)

---

### Task 1.4: Add Error Boundary
**File**: `components/ErrorBoundary.tsx` (NEW)

```typescript
"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen w-full flex items-center justify-center bg-black">
          <div className="text-center px-4">
            <h1 className="text-4xl text-white mb-4">Oops! Something went wrong</h1>
            <p className="text-white/70 mb-6">
              We're sorry for the inconvenience. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Usage in `app/layout.tsx`**:
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
```

---

### Task 1.5: Enable TypeScript Strict Mode
**File**: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,  // CHANGE FROM true
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

**Then fix any TypeScript errors that appear**:
```bash
npm run build
# Fix errors one by one
```

---

## 🟠 PHASE 2: TYPE SAFETY (Week 2)

**Goal**: Establish proper TypeScript architecture
**Time Estimate**: 2-3 days
**Risk**: Low (additive changes)

### Task 2.1: Create TypeScript Types File
**File**: `types/navigation.ts` (NEW)

```typescript
export enum Section {
  Cafe = 'cafe',
  Discover = 'discover',
  Igraonica = 'igraonica'
}

export enum CafeSubSection {
  Meni = 'meni',
  Zakup = 'zakup',
  Radno = 'radno',
  Kontakt = 'kontakt',
  Pricing = 'pricing',
  Dogadjaji = 'dogadjaji',
}

export enum SensorySubSection {
  Floor = 'floor',
  Wall = 'wall',
  Ceiling = 'ceiling'
}

export interface NavigationState {
  section: Section | null
  cafeSubSection: CafeSubSection | null
  sensorySubSection: SensorySubSection | null
}

export interface GalleryImage {
  id: number
  query: string
  url?: string
  alt?: string
}

export interface TabConfig {
  label: string
  section: string
  position: React.CSSProperties
}

export interface PlanetConfig {
  label: string
  section: string
  color: 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'pink'
  size: 'sm' | 'md' | 'lg'
  position: React.CSSProperties
  image?: string
}

export interface Star {
  id: number
  left: number
  top: number
  size: number
  opacity: number
  delay: number
  duration: number
  color?: string
}

export interface StarburstParticle {
  id: number
  angle: number
  distance: number
  size: number
  colorIndex: number
}

export interface AnimationProps {
  text: string
  delay?: number
}

export interface PlanetOrbProps {
  label: string
  color: 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'pink'
  size?: 'sm' | 'md' | 'lg'
  position: React.CSSProperties
  delay?: number
  onClick: () => void
  image?: string
  'aria-label'?: string
  role?: string
}
```

**File**: `types/common.ts` (NEW)

```typescript
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface InteractiveElementProps {
  onClick: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  'aria-label': string
  role?: string
  tabIndex?: number
}
```

**Update `app/page.tsx` imports**:
```typescript
import {
  Section,
  CafeSubSection,
  SensorySubSection,
  type NavigationState,
  type GalleryImage,
  type TabConfig,
  type PlanetConfig,
  type Star,
  type StarburstParticle,
} from '@/types/navigation'
```

**Update state declarations**:
```typescript
const [activeView, setActiveView] = useState<Section | null>(null)
const [cafeSubView, setCafeSubView] = useState<CafeSubSection | null>(null)
const [sensorySubView, setSensorySubView] = useState<SensorySubSection | null>(null)
const [sectionStars, setSectionStars] = useState<Star[]>([])
```

---

## 🟡 PHASE 3: COMPONENT EXTRACTION (Week 3-4)

**Goal**: Break monolith into testable components
**Time Estimate**: 1-2 weeks
**Risk**: Medium (requires careful refactoring)

### Task 3.1: Extract Animation Components

**Create**: `components/animations/HandwritingText.tsx`
```typescript
"use client"

import { motion } from "framer-motion"
import { ANIMATION_EASING } from "@/constants/animations"
import type { AnimationProps } from "@/types/navigation"

export function HandwritingText({ text, delay = 0 }: AnimationProps) {
  return (
    <motion.span
      className="inline-block relative px-4 py-2"
      initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{
        duration: 3,
        delay: delay,
        ease: ANIMATION_EASING.SMOOTH,
      }}
    >
      <motion.span
        className="inline-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: delay,
        }}
      >
        {text}
      </motion.span>
    </motion.span>
  )
}
```

**Repeat for all animations**:
- `CharacterReveal.tsx`
- `PenStrokeReveal.tsx`
- `TypewriterText.tsx`
- `HandwritingEffect.tsx`
- `PlanetOrb.tsx`

**Create barrel export**: `components/animations/index.ts`
```typescript
export { HandwritingText } from './HandwritingText'
export { CharacterReveal } from './CharacterReveal'
export { PenStrokeReveal } from './PenStrokeReveal'
export { TypewriterText } from './TypewriterText'
export { HandwritingEffect } from './HandwritingEffect'
export { PlanetOrb } from './PlanetOrb'
```

**Update `app/page.tsx`**:
```typescript
import {
  HandwritingText,
  CharacterReveal,
  PenStrokeReveal,
  TypewriterText,
  HandwritingEffect,
  PlanetOrb,
} from '@/components/animations'

// Remove lines 52-405 (component definitions)
```

---

### Task 3.2: Extract Starfield Component

**File**: `components/common/Starfield.tsx`
```typescript
"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Star } from "@/types/navigation"

interface StarfieldProps {
  sectionStars?: Star[]
}

export function Starfield({ sectionStars = [] }: StarfieldProps) {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.3 + 0.7,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
    }))
  }, [])

  return (
    <motion.div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base white stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,${star.opacity * 0.8})`,
          }}
          animate={{
            opacity: [star.opacity * 0.7, star.opacity, star.opacity * 0.7],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Section-specific colored stars */}
      <AnimatePresence>
        {sectionStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.size * 3}px ${star.color}, 0 0 ${star.size * 6}px ${star.color}`,
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: Math.random() * 360,
            }}
            animate={{
              opacity: [0, star.opacity, star.opacity * 0.7, star.opacity],
              scale: [0, 1.5, 1, 1.2, 1],
              rotate: [Math.random() * 360, Math.random() * 360 + 360],
            }}
            exit={{
              opacity: 0,
              scale: 0,
              transition: { duration: 0.5 },
            }}
            transition={{
              duration: star.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
```

**Update `app/page.tsx`**:
```typescript
import { Starfield } from '@/components/common/Starfield'

// In render:
<Starfield sectionStars={sectionStars} />

// Remove lines 765-833 (starfield implementation)
```

---

### Task 3.3: Extract Sections

Due to size, I'm providing the structure. Follow the pattern from the Architecture Review:

**Create**: `features/igraonica/IgraonicaSection.tsx`
**Create**: `features/igraonica/data/gallery-images.ts`
**Create**: `features/sensory/SensorySection.tsx`
**Create**: `features/sensory/data/planets.ts`
**Create**: `features/sensory/data/gallery-images.ts`
**Create**: `features/cafe/CafeSection.tsx`
**Create**: `features/cafe/components/GlassFrameMenu.tsx`
**Create**: `features/cafe/components/CafePricing.tsx`
**Create**: `features/cafe/data/menu-items.ts`
**Create**: `features/cafe/data/pricing.ts`

**Result**: `app/page.tsx` reduced from 2,334 lines → ~200 lines

---

## 🔵 PHASE 4: HOOKS & UTILITIES (Week 5)

### Task 4.1: Create Navigation Hook

**File**: `hooks/useNavigation.ts`
```typescript
import { useState, useCallback } from 'react'
import { Section, CafeSubSection, SensorySubSection } from '@/types/navigation'

export function useNavigation() {
  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [cafeSubSection, setCafeSubSection] = useState<CafeSubSection | null>(null)
  const [sensorySubSection, setSensorySubSection] = useState<SensorySubSection | null>(null)

  const navigateTo = useCallback((section: Section) => {
    setActiveSection(section)
    // Reset subsections
    setCafeSubSection(null)
    setSensorySubSection(null)
  }, [])

  const goBack = useCallback(() => {
    if (cafeSubSection) {
      setCafeSubSection(null)
    } else if (sensorySubSection) {
      setSensorySubSection(null)
    } else {
      setActiveSection(null)
    }
  }, [cafeSubSection, sensorySubSection])

  return {
    activeSection,
    cafeSubSection,
    sensorySubSection,
    navigateTo,
    setCafeSubSection,
    setSensorySubSection,
    goBack,
  }
}
```

### Task 4.2: Other Hooks

**File**: `hooks/useMediaQuery.ts`
**File**: `hooks/useReducedMotion.ts`
**File**: `hooks/useSectionStars.ts`

---

## 🟢 PHASE 5: TESTING (Week 6-7)

### Task 5.1: Set Up Vitest

**Install**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

**Create**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**Create**: `vitest.setup.ts`
```typescript
import '@testing-library/jest-dom'
```

### Task 5.2: Write Unit Tests

**Example**: `components/animations/__tests__/PlanetOrb.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { PlanetOrb } from '../PlanetOrb'
import { describe, it, expect, vi } from 'vitest'

describe('PlanetOrb', () => {
  it('renders with label', () => {
    render(
      <PlanetOrb
        label="Floor"
        color="purple"
        position={{ top: '20%', left: '15%' }}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByText('Floor')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(
      <PlanetOrb
        label="Floor"
        color="purple"
        position={{ top: '20%', left: '15%' }}
        onClick={handleClick}
      />
    )

    fireEvent.click(screen.getByText('Floor'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Target**: 60% unit test coverage

### Task 5.3: Expand E2E Tests

Update `xplorium.spec.ts` with QA recommendations.

---

## 📊 PROGRESS TRACKING

Use this checklist:

### Week 1: Critical Fixes
- [x] Fix setTimeout race condition ✅
- [ ] Fix liquid drip hydration
- [ ] Add ARIA labels
- [ ] Add keyboard navigation
- [ ] Add error boundary
- [ ] Enable TypeScript strict mode

### Week 2: Type Safety
- [ ] Create types file
- [ ] Update all state to use types
- [ ] Fix TypeScript errors
- [ ] No `any` types remaining

### Week 3-4: Component Extraction
- [ ] Extract animations (6 components)
- [ ] Extract Starfield
- [ ] Extract Igraonica section
- [ ] Extract Sensory section
- [ ] Extract Cafe section
- [ ] Main page.tsx < 200 lines

### Week 5: Hooks & Utilities
- [ ] Create useNavigation hook
- [ ] Create useReducedMotion hook
- [ ] Create useMediaQuery hook
- [ ] Create useSectionStars hook

### Week 6-7: Testing
- [ ] Set up Vitest
- [ ] Write unit tests (60% coverage)
- [ ] Write integration tests
- [ ] Expand E2E tests (85% total coverage)

### Week 8: Polish
- [ ] Add loading states
- [ ] Add performance monitoring
- [ ] Final QA pass
- [ ] Production deployment

---

## 🎯 SUCCESS METRICS

**Before** → **After**

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| File Size (page.tsx) | 2,334 lines | 150-200 lines | 🔴 |
| Testability Score | 4/10 | 8/10 | 🔴 |
| Test Coverage | 15% | 85% | 🔴 |
| ARIA Compliance | 20% | 100% | 🔴 |
| TypeScript Safety | 60% | 95% | 🔴 |
| Build Errors | Ignored | 0 | 🔴 |

---

## 📝 NOTES

- Implement in order (dependencies)
- Test after each phase
- Commit after each task
- Deploy to staging after each phase
- Get user feedback before next phase

**This roadmap will take 6-8 weeks for one developer working full-time.**

For questions or issues, refer back to:
- `CODE_REVIEW_FIXES_SUMMARY.md` (performance optimizations)
- Architecture Review (agent output above)
- QA Review (agent output above)
