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
```

## Project Architecture

### App Structure (Next.js App Router)
- `app/layout.tsx` - Root layout with fonts (Geist, Geist Mono, Great Vibes) and Vercel Analytics
- `app/page.tsx` - **Main landing page** (1335 lines) - all site content and logic
- `app/globals.css` - Tailwind v4 configuration with CSS variables for theming

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
Full shadcn/ui component library (50+ components) including:
- Forms: `input.tsx`, `button.tsx`, `select.tsx`, `checkbox.tsx`, `textarea.tsx`
- Layout: `card.tsx`, `dialog.tsx`, `sheet.tsx`, `sidebar.tsx`, `tabs.tsx`
- Feedback: `toast.tsx`, `alert.tsx`, `progress.tsx`, `skeleton.tsx`
- Navigation: `navigation-menu.tsx`, `breadcrumb.tsx`, `menubar.tsx`

### Utilities
- `lib/utils.ts` - Single function `cn()` for className merging (clsx + tailwind-merge)
- `components/theme-provider.tsx` - next-themes integration

## Key Configuration

### TypeScript Paths
```typescript
"@/*": ["./*"]  // Root-level imports
```
Usage: `import { cn } from "@/lib/utils"`

### Tailwind v4 Setup
- PostCSS plugin: `@tailwindcss/postcss`
- Custom CSS variables for color system (oklch format)
- Great Vibes font variable for handwriting text: `font-['Great_Vibes']`
- Custom dark variant: `@custom-variant dark (&:is(.dark *))`

### Next.js Config
```javascript
typescript: { ignoreBuildErrors: true }  // TypeScript errors don't block builds
images: { unoptimized: true }            // No image optimization
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


## Visual Development

### Design Principles
- Comprehensive design checklist in `/context/design-principles.md`
-