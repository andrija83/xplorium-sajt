# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Xplorium** - an interactive landing page for a family entertainment venue featuring a cafe, sensory room, and interactive playground (igraonica). The site uses advanced animations and creative UI patterns to showcase the three main sections.

**Tech Stack:**
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS 4 (with PostCSS)
- Framer Motion (animations)
- shadcn/ui components (New York style)
- Radix UI primitives

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
```

## Project Architecture

### App Structure (Next.js App Router)
- `app/layout.tsx` - Root layout with fonts (Geist, Geist Mono, Great Vibes) and Vercel Analytics
- `app/page.tsx` - **Main landing page** (715 lines) - orchestrates all sections
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

**Common Components** (`components/common/`):
- `Starfield.tsx` - Animated starfield background (100 stars)
- `LoadingSpinner.tsx` - Loading indicator

**UI Components** (`components/ui/`):
Full shadcn/ui component library (50+ components) including forms, layout, feedback, and navigation primitives.

### Configuration & Constants

- `constants/animations.ts` - Centralized animation configuration:
  - `ANIMATION_TIMING` - Durations, delays, counts
  - `ANIMATION_EASING` - Easing curves ([0.22, 1, 0.36, 1] for smooth, [0.34, 1.56, 0.64, 1] for bouncy)
  - `NEON_COLORS` - Section color schemes (Cafe: cyan, Sensory: purple, Igraonica: pink)
  - `PARTICLE_COLORS` - Starburst and particle effects

- `lib/utils.ts` - Single utility: `cn()` for className merging (clsx + tailwind-merge)

### State Management Architecture

The main landing page (`app/page.tsx`) uses React state hooks:

1. **Navigation State**:
   - `isAnimating` - Controls X logo animation (prevents multiple clicks)
   - `showBrand` - Shows/hides brand name + navigation after X logo click
   - `activeView` - Tracks active section (null | "cafe" | "discover" | "igraonica")

2. **Subsection State**:
   - `sensorySubView` - Sensory subsection (null | "floor" | "wall" | "ceiling")
   - `cafeSubView` - Cafe subsection (null | "meni" | "zakup" | "radno" | "kontakt")

3. **Performance**:
   - `prefersReducedMotion` - Detects user's motion preference for accessibility

### Navigation Flow

```
X Logo Click
    ↓
Brand Reveal → Three Main Sections
    ├── Cafe → Glass Frame Menu (4 neon options)
    ├── Sensory → 3 Planet Orbs (Floor/Wall/Ceiling)
    └── Igraonica → Direct Content (Typewriter Description)
```

## TypeScript Configuration

**Path Aliases:**
```typescript
"@/*": ["./*"]  // Root-level imports
```
Usage: `import { cn } from "@/lib/utils"`

**Important Settings:**
- `jsx: "react-jsx"` - New JSX transform (no React import needed)
- `moduleResolution: "bundler"` - Next.js 16 bundler resolution

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

## Testing

### E2E Tests (Playwright)
- Test directory: `./tests/`
- Config: `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Features: Trace on retry, screenshots on failure

### Unit Tests (Vitest)
- Test files: `*.test.tsx` or `*.test.ts` co-located with components
- Existing tests:
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

## Component Development Guidelines

### When Creating New Components

1. **Co-locate by feature** - Place in `features/{section}/` if section-specific
2. **Reusable in `components/`** - Only if used across multiple features
3. **Animations in `components/animations/`** - For shared animation patterns
4. **Use constants** - Reference `constants/animations.ts` for timing/colors
5. **Export from index** - Add to `components/animations/index.ts` for clean imports

### Error Handling
- All pages wrapped in `<ErrorBoundary>` (see `components/ErrorBoundary.tsx`)
- Graceful fallback UI with error message and reset button

### Performance Considerations
- Respect `prefersReducedMotion` for accessibility
- Use `whileInView` with `viewport={{ once: true }}` for scroll animations
- Memoize expensive calculations with `useMemo`
- Use `AnimatePresence mode="wait"` to prevent layout shift

## Content Structure

Current content uses **placeholder patterns**:
- Gallery images: `/placeholder.svg?query=...`
- Contact info: Placeholder text (address, phone, email)
- Google Maps: Configured for specific location

When adding real content:
1. Place images in `public/` directory
2. Update contact information in Cafe > Kontakt section
3. Replace placeholder descriptions with actual venue details
