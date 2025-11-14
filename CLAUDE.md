# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Xplorium** - an interactive landing page for a family entertainment venue featuring a cafe, sensory room, and interactive playground (igraonica). The site uses advanced animations and creative UI patterns to showcase the three main sections.

**Tech Stack:**
- Next.js 16.0.0 (App Router)
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4.1.9 (with PostCSS)
- Framer Motion (latest)
- shadcn/ui components (New York style, 56 components)
- Radix UI primitives
- Playwright (E2E testing)
- Vercel Analytics

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
npm run test         # Run Playwright tests
npm run test:ui      # Run Playwright tests with UI
npm run test:headed  # Run Playwright tests in headed mode
npm run test:report  # Show Playwright test report
```

## Project Architecture

### Directory Structure
```
xplorium-sajt/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with fonts, metadata, analytics
│   ├── page.tsx           # Main landing page (2244 lines)
│   └── globals.css        # Tailwind v4 configuration, CSS variables
├── components/
│   ├── ui/                # shadcn/ui components (56 files)
│   └── theme-provider.tsx # next-themes integration
├── hooks/                  # Custom React hooks
│   ├── use-mobile.ts      # Mobile detection hook
│   └── use-toast.ts       # Toast notifications hook
├── lib/
│   └── utils.ts           # cn() utility for className merging
├── public/                 # Static assets
│   ├── crystal-x-logo.png # Main logo (1.6MB)
│   ├── crystal-x-logo.jpg # Logo variant (308KB)
│   ├── x-logo-*.svg       # Logo variations (cosmic-nebula, neon-tube, prismatic-crystal)
│   └── placeholder.*      # Placeholder images
├── styles/
│   └── globals.css        # Additional global styles
├── tests/
│   └── xplorium.spec.ts   # Playwright E2E tests
├── context/
│   └── design-principles.md # S-Tier SaaS design checklist
├── .github/workflows/
│   └── playwright.yml     # CI/CD for automated testing
└── Configuration files

### App Structure (Next.js App Router)
- `app/layout.tsx` - Root layout with comprehensive metadata, SEO, fonts (Geist, Geist Mono, Great Vibes), and Vercel Analytics
- `app/page.tsx` - **Main landing page** (2244 lines) - all site content and logic
- `app/globals.css` - Tailwind v4 configuration with CSS variables for theming (light/dark mode)

### Component Organization
The landing page (`app/page.tsx`) is organized as a **single-file component** with:

1. **Animation Components** (lines 36-218):
   - `HandwritingText` - Clip-path reveal animation
   - `CharacterReveal` - Character-by-character slide-in
   - `PenStrokeReveal` - **CURRENTLY USED** for navigation - pen stroke effect with rotation
   - `TypewriterText` - **CURRENTLY USED** in Igraonica section
   - `HandwritingEffect` - Alternative handwriting animation
   - `PlanetOrb` - **CURRENTLY USED** in Sensory section - animated planet navigation

2. **Main State** (lines 384-421):
   - `isAnimating` - Controls X logo animation
   - `showBrand` - Shows/hides brand name + navigation
   - `activeView` - Tracks active section (null | "cafe" | "discover" | "igraonica")
   - `sensorySubView` - Sensory subsection (null | "floor" | "wall" | "ceiling")
   - `cafeSubView` - Cafe subsection (null | "meni" | "zakup" | "radno" | "kontakt")

3. **Navigation Flow**:
   - Start: X logo click → Brand reveal → Three main navigation items (Cafe, Sensory, Igraonica)
   - Cafe: Glass frame menu with 4 neon-glowing options
   - Sensory: 3 planet orbs (Floor/Wall/Ceiling) with glow effects
   - Igraonica: Direct content view with typewriter description

4. **UI Patterns**:
   - **Starfield Background** - 100 animated stars (lines 573-662)
   - **Neon Text Effects** - Multi-layer CSS text-shadow for navigation
   - **Planet Orbs** - Gradient spheres with glow, texture overlays, floating animation
   - **Glass Frame** - Border glow, corner screws, backdrop-blur
   - **Scroll Galleries** - Snap-scroll sections with whileInView animations

### UI Components (`components/ui/`)
Full shadcn/ui component library (56 components) using New York style variant:
- Forms: `input.tsx`, `button.tsx`, `select.tsx`, `checkbox.tsx`, `textarea.tsx`, `input-otp.tsx`, `input-group.tsx`, `form.tsx`, `label.tsx`, `field.tsx`
- Layout: `card.tsx`, `dialog.tsx`, `sheet.tsx`, `sidebar.tsx`, `tabs.tsx`, `separator.tsx`, `resizable.tsx`, `scroll-area.tsx`, `table.tsx`
- Feedback: `toast.tsx`, `alert.tsx`, `alert-dialog.tsx`, `progress.tsx`, `skeleton.tsx`, `spinner.tsx`, `badge.tsx`
- Navigation: `navigation-menu.tsx`, `breadcrumb.tsx`, `menubar.tsx`, `pagination.tsx`
- Interactive: `button-group.tsx`, `toggle.tsx`, `toggle-group.tsx`, `radio-group.tsx`, `slider.tsx`, `popover.tsx`, `hover-card.tsx`, `context-menu.tsx`, `carousel.tsx`
- Data: `chart.tsx`, `avatar.tsx`, `item.tsx`

### Hooks
- `hooks/use-mobile.ts` - Mobile device detection hook
- `hooks/use-toast.ts` - Toast notification management hook
- `components/ui/use-toast.ts` - Toast hook implementation (shadcn/ui)
- `components/ui/use-mobile.tsx` - Mobile hook implementation (shadcn/ui)

### Utilities
- `lib/utils.ts` - Single function `cn()` for className merging (clsx + tailwind-merge)
- `components/theme-provider.tsx` - next-themes integration for dark mode support

## Key Configuration

### TypeScript Configuration
**Import Paths** (`tsconfig.json`):
```typescript
"@/*": ["./*"]  // Root-level imports
```
Usage examples:
- `import { cn } from "@/lib/utils"`
- `import { Button } from "@/components/ui/button"`
- `import { useMobile } from "@/hooks/use-mobile"`

**shadcn/ui Configuration** (`components.json`):
```json
{
  "style": "new-york",          // Component style variant
  "rsc": true,                  // React Server Components enabled
  "tsx": true,                  // TypeScript support
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"       // Lucide React icons
}
```

### Tailwind v4 Setup
- PostCSS plugin: `@tailwindcss/postcss`
- Custom CSS variables for color system (oklch format)
- Great Vibes font variable for handwriting text: `font-['Great_Vibes']`
- Custom dark variant: `@custom-variant dark (&:is(.dark *))`
- tw-animate-css plugin for additional animations
- Global styles include:
  - Smooth scrolling behavior
  - Focus-visible improvements (cyan outline)
  - Optimized text rendering (antialiased)
  - Reduced motion support for accessibility

### Next.js Config (`next.config.mjs`)
```javascript
typescript: { ignoreBuildErrors: true }  // TypeScript errors don't block builds
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
compress: true                           // Enable gzip compression
poweredByHeader: false                   // Disable X-Powered-By header
reactStrictMode: true                    // Enable strict mode checks
```

## Animation Guidelines

When working with animations in this project:

1. **Framer Motion Patterns Used**:
   - `initial/animate/exit` - Entry/exit states
   - `whileHover/whileTap` - Interactive states
   - `whileInView` - Scroll-triggered animations
   - `AnimatePresence mode="wait"` - Sequential page transitions

2. **Common Transition Curves**:
   - `[0.22, 1, 0.36, 1]` - Smooth ease (most common)
   - `[0.34, 1.56, 0.64, 1]` - Bouncy ease (pen strokes)
   - `easeInOut` - Standard easing

3. **Text Animations**:
   - Navigation uses `PenStrokeReveal` (0.2s delay between chars)
   - Descriptions use `TypewriterText` or `HandwritingEffect`
   - Stagger delays: 0.05-0.20s per character depending on effect

## Styling Conventions

- **Responsive breakpoints**: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- **Spacing**: Use Tailwind spacing scale (4px increments)
- **Colors**:
  - Neon cyan (`#22d3ee`) for Cafe
  - Neon purple (`#a855f7`) for Sensory
  - Neon pink (`#ec4899`) for Igraonica
- **Backdrop effects**: `backdrop-blur-sm`, `bg-black/10`, `bg-white/5`
- **Text shadows**: Multi-layer shadows for glow effects

## Content Structure

The site has **placeholder content** ready to be replaced:
- Gallery images use `/placeholder.svg?query=...` pattern
- Contact info has placeholder text (address, phone, email)
- Google Maps embed is configured for a specific location

When adding real content:
1. Replace placeholder images in `public/` directory
2. Update contact information in Cafe > Kontakt section (lines 950-1001)
3. Consider adding actual descriptions for each section


## Testing & Quality Assurance

### Playwright E2E Tests
Location: `tests/xplorium.spec.ts`

**Test Coverage:**
- Homepage loading and title verification
- X logo display and initial animations
- Starfield background with 100 animated stars
- Brand name reveal after logo click
- Three main navigation sections (Cafe, Sensory, Igraonica)
- Interactive elements and user flows

**Running Tests:**
```bash
npm run test         # Run all tests headless
npm run test:ui      # Interactive UI mode
npm run test:headed  # Watch tests run in browser
npm run test:report  # View HTML test report
```

**CI/CD Integration:**
- GitHub Actions workflow: `.github/workflows/playwright.yml`
- Runs on: push/PR to main, master, dev branches
- Automated testing on every commit
- Uploads test reports and screenshots on failure
- Uses Node.js 20, installs Chromium browser
- Build verification before running tests

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (tested via Playwright)
- Optimized for desktop and tablet viewports

## SEO & Metadata

### Comprehensive Meta Tags (`app/layout.tsx`)
```typescript
metadata: {
  title: "Xplorium - Explore the Extraordinary"
  description: "Interactive playground, sensory room, and cafe for families..."
  keywords: ["playground", "sensory room", "cafe", "family", "interactive", "children"]

  // Social Media
  openGraph: { title, description, type: "website", locale: "en_US" }
  twitter: { card: "summary_large_image", title, description }

  // Search Engine Optimization
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }

  // Performance
  formatDetection: { email: false, address: false, telephone: false }
}
```

### Analytics
- Vercel Analytics integrated via `@vercel/analytics/next`
- Tracks page views and user interactions
- Imported in root layout for global coverage

## Visual Development

### Design Principles
- Comprehensive S-Tier SaaS design checklist in `/context/design-principles.md`
- Inspired by Stripe, Airbnb, and Linear design systems
- Focus on: User-first design, meticulous craft, speed & performance
- Accessibility: WCAG AA+ compliance targets
- Color palette: Primary brand color, neutrals (5-7 grays), semantic colors
- Typography: Clean sans-serif (Geist), modular scale, generous line height
- Spacing: 8px base unit system
- Consistent border radii, micro-interactions, and animations

## Development Workflow

### Key Dependencies
**Core Framework:**
- `next@16.0.0` - React framework with App Router
- `react@19.2.0`, `react-dom@19.2.0` - UI library
- `typescript@^5` - Type safety

**UI & Styling:**
- `@tailwindcss/postcss@^4.1.9` - Tailwind CSS v4
- `tailwindcss@^4.1.9` - Utility-first CSS framework
- `framer-motion@latest` - Animation library
- `lucide-react@^0.454.0` - Icon library (1000+ icons)
- `class-variance-authority@^0.7.1` - Component variant management
- `tailwind-merge@^2.5.5` - Merge Tailwind classes
- `tailwindcss-animate@^1.0.7` - Animation utilities
- `tw-animate-css@1.3.3` - Additional CSS animations

**Radix UI Primitives (20+ packages):**
All `@radix-ui/react-*` packages for accessible, unstyled components

**Forms & Validation:**
- `react-hook-form@^7.60.0` - Form state management
- `@hookform/resolvers@^3.10.0` - Form validation resolvers
- `zod@3.25.76` - TypeScript-first schema validation

**Additional Libraries:**
- `date-fns@4.1.0` - Date manipulation
- `embla-carousel-react@8.5.1` - Carousel component
- `recharts@2.15.4` - Charting library
- `sonner@^1.7.4` - Toast notifications
- `next-themes@^0.4.6` - Dark mode support

**Testing:**
- `@playwright/test@^1.56.1` - E2E testing framework

### Best Practices

**When Adding New Features:**
1. Use existing shadcn/ui components from `components/ui/` when possible
2. Follow the established animation patterns (see Animation Guidelines)
3. Maintain the single-file approach for page.tsx or refactor if needed
4. Add TypeScript types for all new components and functions
5. Use Tailwind utility classes, avoid custom CSS unless necessary
6. Test animations with reduced motion support
7. Add Playwright tests for new interactive features

**Code Style:**
- Use `"use client"` directive for client-side interactive components
- Import types with `import type` syntax
- Use functional components with hooks
- Prefer const over let, avoid var
- Use meaningful variable names (camelCase for variables, PascalCase for components)
- Comment complex animation logic and state transitions

**Animation Performance:**
- Keep animation durations between 150-300ms for micro-interactions
- Use transform and opacity for GPU-accelerated animations
- Test with browser DevTools Performance tab
- Implement reduced motion support for accessibility

**State Management:**
- Keep state local to components when possible
- Use React hooks (useState, useEffect, useMemo, useCallback)
- No global state management library currently used

### Environment Variables
```bash
NEXT_PUBLIC_SITE_URL  # Site URL for metadata (default: https://xplorium.com)
```

### Deployment
- Optimized for Vercel deployment
- Build command: `npm run build`
- Start command: `npm start`
- Automatic deployments on git push (if configured)
- Edge runtime compatible

### Recent Commits
- **Spark Particles** - Latest feature addition
- **New Features** - Ongoing enhancements
- Previous work included page updates and feature additions

## Troubleshooting

### Common Issues

**Build Errors:**
- TypeScript errors don't block builds (`ignoreBuildErrors: true`)
- If build fails, check Next.js and React versions compatibility
- Clear `.next` directory: `rm -rf .next && npm run build`

**Animation Issues:**
- Check Framer Motion version compatibility
- Verify motion components have proper `initial`, `animate`, `transition` props
- Test with `prefers-reduced-motion` media query

**Styling Issues:**
- Tailwind v4 uses different config format (CSS-based, not JS)
- Ensure `@import "tailwindcss"` is in globals.css
- Check for class name conflicts with `cn()` utility

**Component Issues:**
- Verify correct import paths using `@/` alias
- Check shadcn/ui component documentation for props
- Ensure Radix UI primitives are installed

### Getting Help
- Next.js docs: https://nextjs.org/docs
- Tailwind CSS v4 docs: https://tailwindcss.com/docs
- shadcn/ui docs: https://ui.shadcn.com
- Framer Motion docs: https://www.framer.com/motion
- Playwright docs: https://playwright.dev