# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Xplorium** - a comprehensive web application for a family entertainment venue featuring a cafe, sensory room, and interactive playground (igraonica). The site includes an advanced interactive landing page with creative UI patterns and a full-featured admin panel for managing all venue operations.

**Project Status:** 95% Complete - Production Ready (pending email integration)

**Tech Stack:**
- Next.js 16 (App Router)
- React 19.2
- TypeScript 5
- Tailwind CSS 4 (with PostCSS)
- Framer Motion (animations)
- shadcn/ui components (New York style)
- Radix UI primitives
- PostgreSQL (Neon - serverless)
- Prisma ORM
- NextAuth v5 (authentication)

**For comprehensive project status, features, and roadmap, see:** `PROJECT_STATUS.md`

**Documentation:**
- Active documentation is in the root and `docs/` directory
- Completed/archived documentation is in `docs/archive/` - see `docs/archive/ARCHIVE_INDEX.md` for a full list
- Reference `OAUTH_IMPLEMENTATION_PLAN.md` for future OAuth integration
- Reference `TODO_RESEND_MIGRATION.md` for pending email service migration

## Common Commands

```bash
# Development
npm run dev          # Start dev server (default: http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint

# Testing
npm test             # Run Playwright E2E tests
npm run test:ui      # Run tests in Playwright UI mode
npm run test:headed  # Run tests in headed browser mode
npm run test:report  # Show test report

# Unit Testing
npm run test:unit           # Run Vitest in watch mode
npm run test:unit:ui        # Run Vitest with UI
npm run test:unit:run       # Run Vitest once
npm run test:unit:coverage  # Run with coverage report

# Database
npm run db:studio           # Open Prisma Studio (database GUI)
npm run db:seed             # Seed database with admin account
```

## Project Architecture

### App Structure (Next.js App Router)
- `app/layout.tsx` - Root layout with fonts (Geist, Geist Mono, Great Vibes) and Vercel Analytics
- `app/page.tsx` - **Main landing page** (765 lines) - orchestrates all sections
- `app/globals.css` - Tailwind v4 configuration with CSS variables for theming (oklch color format)

### Feature-Based Organization
The application is organized by features, not components:

```
features/
├── cafe/CafeSection.tsx           # Cafe section with glass frame submenu
├── sensory/SensorySection.tsx     # Sensory room with planet orb navigation
└── igraonica/IgraonicaSection.tsx # Playground section with typewriter effect
```

### Reusable Components

**Animation Components** (`components/animations/`):
- `PenStrokeReveal.tsx` - **CURRENTLY USED** for navigation - pen stroke effect with rotation
- `TypewriterText.tsx` - **CURRENTLY USED** in Igraonica section
- `PlanetOrb.tsx` - **CURRENTLY USED** in Sensory section - animated planet navigation
- `HandwritingText.tsx` - Clip-path reveal animation
- `CharacterReveal.tsx` - Character-by-character slide-in
- `HandwritingEffect.tsx` - Alternative handwriting animation

**Auth Components** (`components/auth/`):
- `SignInModal.tsx` - Sign in modal with email/password form
- `SignUpModal.tsx` - Sign up modal with registration form
- `AuthButtons.tsx` - Fixed position Sign In/Sign Up buttons in top-right corner

**Common Components** (`components/common/`):
- `Starfield.tsx` - Animated starfield background (100 stars)
- `LoadingSpinner.tsx` - Loading indicator
- `AuthButtons.tsx` - Authentication button group

**UI Components** (`components/ui/`):
Full shadcn/ui component library (50+ components) including forms, layout, feedback, and navigation primitives.

### Configuration & Constants

- `constants/animations.ts` - Centralized animation configuration:
  - `ANIMATION_TIMING` - Durations, delays, counts
  - `ANIMATION_EASING` - Easing curves ([0.22, 1, 0.36, 1] for smooth, [0.34, 1.56, 0.64, 1] for bouncy)
  - `NEON_COLORS` - Section color schemes (Cafe: cyan, Sensory: purple, Igraonica: pink)
  - `PARTICLE_COLORS` - Starburst and particle effects

- `lib/utils.ts` - Utility functions: `cn()` for className merging (clsx + tailwind-merge)
- `lib/logger.ts` - **Centralized logging utility** with environment-aware logging, specialized methods for auth, DB, API, and server actions
- `lib/auth.ts` - NextAuth v5 configuration and server-side auth utilities
- `lib/auth-utils.ts` - Client-side auth utilities and session helpers
- `lib/audit.ts` - Audit logging for all admin actions
- `lib/validation.ts` - Zod schemas for form validation

- `types/` - TypeScript type definitions organized by domain:
  - `types/index.ts` - Main export point for all types
  - `types/common.ts` - Shared types (TextAnimationProps, etc.)
  - `types/navigation.ts` - Navigation-related types
  - `types/database.ts` - Database-related types extracted from Prisma

### Custom Hooks

Located in `hooks/` directory:
- `useReducedMotion.ts` - Detects prefers-reduced-motion setting
- `useKeyboardNavigation.ts` - Keyboard navigation support (Escape to go back)
- `useNavigation.ts` - Navigation state management helpers
- `use-mobile.ts` - Mobile device detection
- `use-toast.ts` - Toast notification system

Export pattern: Import from `@/hooks` (barrel export via index.ts)

### State Management Architecture

The main landing page (`app/page.tsx`) uses React state hooks:

1. **Navigation State**:
   - `isAnimating` - Controls X logo animation (prevents multiple clicks)
   - `showBrand` - Shows/hides brand name + navigation after X logo click
   - `activeView` - Tracks active section (null | "cafe" | "discover" | "igraonica")

2. **Subsection State**:
   - `sensorySubView` - Sensory subsection (null | "floor" | "wall" | "ceiling")
   - `cafeSubView` - Cafe subsection (null | "meni" | "zakup" | "radno" | "kontakt")

3. **Modal State** (following Mobiscroll pattern):
   - `isSignInOpen` - Controls Sign In modal visibility
   - `isSignUpOpen` - Controls Sign Up modal visibility

4. **Performance & Accessibility**:
   - `prefersReducedMotion` - Detects user's motion preference for accessibility
   - `isMobile` - Device detection for particle count optimization

### Navigation Flow

```
X Logo Click
    ↓
Brand Reveal → Three Main Sections
    ├── Cafe → Glass Frame Menu (4 neon options)
    ├── Sensory → 3 Planet Orbs (Floor/Wall/Ceiling)
    └── Igraonica → Direct Content (Typewriter Description)
```

**Keyboard Navigation:**
- Escape key goes back to previous view/menu
- Implements progressive navigation (subview → section → main menu)

## TypeScript Configuration

**Path Aliases:**
```typescript
"@/*": ["./*"]  // Root-level imports
```
Usage: `import { cn } from "@/lib/utils"`

**Important Settings:**
- `jsx: "react-jsx"` - New JSX transform (no React import needed)
- `moduleResolution: "bundler"` - Next.js 16 bundler resolution
- `strict: true` - Strict type checking enabled

## Styling & Design System

### Tailwind v4 Setup
- PostCSS plugin: `@tailwindcss/postcss`
- Custom CSS variables in oklch format for better color manipulation
- Great Vibes font for handwriting text: `font-['Great_Vibes']`
- Custom dark variant: `@custom-variant dark (&:is(.dark *))`

### Common UI Patterns

**Neon Text Effects:**
Multi-layer CSS text-shadow for glowing navigation items:
```css
textShadow: "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee, 0 0 40px #06b6d4"
```

**Planet Orbs:**
- Gradient spheres with glow and texture overlays
- Floating animation with random duration (3-5s)
- WhileHover scale and glow increase

**Glass Frame UI:**
- Border glow with corner screws
- `backdrop-blur-sm` with `bg-black/10` or `bg-white/5`
- Neon-colored borders matching section theme

**Starfield Background:**
- 100 animated stars with random positions and speeds
- Continuous vertical scrolling effect

### Responsive Breakpoints
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

## Animation Guidelines

### Framer Motion Patterns Used

1. **Entry/Exit Animations:**
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
```

2. **Interactive States:**
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

3. **Scroll-Triggered:**
```typescript
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
```

4. **Sequential Transitions:**
```typescript
<AnimatePresence mode="wait">
  {/* Content */}
</AnimatePresence>
```

### Common Transition Timings
- Smooth ease: `[0.22, 1, 0.36, 1]` (most common)
- Bouncy ease: `[0.34, 1.56, 0.64, 1]` (pen strokes, playful UI)
- Standard: `"easeInOut"`, `"easeOut"`

### Text Animation Guidelines
- Navigation: `PenStrokeReveal` (0.2s delay between characters)
- Descriptions: `TypewriterText` or `HandwritingEffect`
- Stagger delays: 0.05-0.20s per character depending on effect

### Performance Optimization
- Particle count reduced on mobile (25 vs 50 particles)
- `useMemo` for particle configurations to prevent hydration mismatches
- `prefersReducedMotion` respected throughout for accessibility
- `willChange` CSS property used for animated elements

## Testing

### E2E Tests (Playwright)
- Test directory: `./tests/`
- Config: `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Features: Trace on retry, screenshots on failure

### Unit Tests (Vitest)
- Test files: `*.test.tsx` or `*.test.ts` co-located with components
- Config: `vitest.config.ts`
- Setup file: `vitest.setup.ts`
- Environment: jsdom
- Existing tests:
  - `lib/logger.test.ts` - Logger utility tests (9 tests)
  - `components/common/LoadingSpinner.test.tsx`
  - `components/ErrorBoundary.test.tsx`
  - `hooks/useReducedMotion.test.ts`

## Next.js Configuration

Key settings in `next.config.mjs`:
```javascript
typescript: { ignoreBuildErrors: false }  // Enforce type safety
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60
}
compress: true
reactStrictMode: true
poweredByHeader: false  // Remove X-Powered-By header
```

## Code Quality Standards

### Logging
- **NEVER use console.log/error/warn** - Use `logger` from `lib/logger.ts` instead
- Available methods: `debug()`, `info()`, `warn()`, `error()`, `serverActionError()`, `apiError()`, `auth()`, `db()`
- Logger is environment-aware (dev/prod/test) and provides structured logging
- Example: `logger.serverActionError('createUser', error)` or `logger.db('Fetching users', { userId })`

### Linting
- **ESLint v9** with flat config (`eslint.config.mjs`)
- Run `npm run lint` before committing
- Auto-fix available issues: `npm run lint -- --fix`
- Current status: 0 errors, 148 warnings (mostly unused vars and explicit any)

### Tailwind Classes
- **NEVER use dynamic class construction** with template literals (e.g., `text-${color}-400`)
- **ALWAYS use complete class strings** in color/variant maps
- Example:
```typescript
// ❌ Bad - Won't be detected by Tailwind JIT
className={`text-${color}-400`}

// ✅ Good - Complete class strings
const colorClasses = {
  cyan: 'text-cyan-400',
  purple: 'text-purple-400'
}
className={colorClasses[color]}
```

## Component Development Guidelines

### When Creating New Components

1. **Co-locate by feature** - Place in `features/{section}/` if section-specific
2. **Reusable in `components/`** - Only if used across multiple features
3. **Animations in `components/animations/`** - For shared animation patterns
4. **Use constants** - Reference `constants/animations.ts` for timing/colors
5. **Export from index** - Add to `components/animations/index.ts` for clean imports
6. **Types in `types/`** - Add shared types to appropriate files in types directory
7. **Use logger** - Import and use `logger` from `lib/logger.ts` for all logging needs

### Error Handling
- All pages wrapped in `<ErrorBoundary>` (see `components/ErrorBoundary.tsx`)
- Graceful fallback UI with error message and reset button

### Performance Considerations
- Respect `prefersReducedMotion` for accessibility
- Use `whileInView` with `viewport={{ once: true }}` for scroll animations
- Memoize expensive calculations with `useMemo`
- Use `AnimatePresence mode="wait"` to prevent layout shift
- Check `isMobile` for particle count optimization

### Modal Pattern (Mobiscroll-Inspired)
When creating modals, follow this pattern:
```typescript
const [isOpen, setIsOpen] = useState(false)

// Modal component receives:
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```
See `SignInModal.tsx` and `SignUpModal.tsx` for reference implementations.

## Content Structure

Current content uses **placeholder patterns**:
- Gallery images: `/placeholder.svg?query=...`
- Contact info: Placeholder text (address, phone, email)
- Google Maps: Configured for specific location

When adding real content:
1. Place images in `public/` directory
2. Update contact information in Cafe > Kontakt section
3. Replace placeholder descriptions with actual venue details
