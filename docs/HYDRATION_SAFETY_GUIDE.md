# Hydration Safety Guide

## Overview

This document explains how the Xplorium application prevents React hydration mismatches, particularly those caused by `Math.random()` usage in components. Hydration errors occur when server-rendered HTML doesn't match the client-side rendering.

---

## The Hydration Problem

### What is Hydration?

In React Server Components and SSR (Server-Side Rendering), the server generates HTML that gets sent to the client. React then "hydrates" this HTML by attaching event listeners and making it interactive. For this to work properly, the client-side render must produce the exact same HTML structure as the server.

### Why Math.random() Causes Issues

When you use `Math.random()` during component rendering:

```typescript
// ❌ BAD: Causes hydration mismatch
const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,  // Different on server vs client!
  y: Math.random() * 100,
}))
```

**Problem:**
- Server generates HTML with random values: `x: 42.5, y: 78.3`
- Client regenerates with different random values: `x: 15.7, y: 93.1`
- React sees mismatch → Hydration error → Re-render → Flash of incorrect content

---

## Solution: Seeded Random Numbers

### The Seeded Random Utility

We created a deterministic pseudo-random number generator that produces the same sequence of "random" numbers given the same seed.

**Location:** `lib/seeded-random.ts`

**How it works:**
1. Uses a Linear Congruential Generator (LCG) algorithm
2. Same seed → Same sequence of numbers
3. Server and client use same seed → Same "random" values
4. No hydration mismatch!

### API Reference

#### `seededRandom(seed: number): SeededRandom`

Creates a seeded random number generator.

```typescript
import { seededRandom } from '@/lib/seeded-random'

const rng = seededRandom(12345)
const value = rng.next() // 0.xxx (always the same for seed 12345)
```

**Methods:**

- **`next(): number`** - Returns number between 0 and 1
  ```typescript
  const rng = seededRandom(12345)
  const val = rng.next() // 0.xyz (deterministic)
  ```

- **`nextInt(min: number, max: number): number`** - Returns integer between min and max (inclusive)
  ```typescript
  const rng = seededRandom(12345)
  const dice = rng.nextInt(1, 6) // 1-6 (deterministic)
  ```

- **`nextFloat(min: number, max: number): number`** - Returns float between min and max
  ```typescript
  const rng = seededRandom(12345)
  const speed = rng.nextFloat(1.5, 3.5) // 1.5-3.5 (deterministic)
  ```

- **`reset(newSeed: number): void`** - Reset the generator with a new seed
  ```typescript
  const rng = seededRandom(12345)
  rng.reset(54321) // Start new sequence
  ```

#### `hashString(str: string): number`

Converts a string to a numeric hash for use as a seed.

```typescript
import { hashString, seededRandom } from '@/lib/seeded-random'

const seed = hashString('my-component-id')
const rng = seededRandom(seed)
```

---

## Implementation Examples

### Example 1: Starburst Particles

**Before (Hydration Risk):**
```typescript
const starburstParticles = useMemo(() => {
  const count = getParticleCount(isMobile)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i * 360) / count + Math.random() * 10,  // ❌ Hydration risk
    distance: 100 + Math.random() * 200,              // ❌ Hydration risk
    size: 3 + Math.random() * 10,                     // ❌ Hydration risk
  }))
}, [isMobile])
```

**After (Hydration Safe):**
```typescript
import { seededRandom } from '@/lib/seeded-random'

const starburstParticles = useMemo(() => {
  const count = getParticleCount(isMobile)
  const rng = seededRandom(12345) // ✅ Fixed seed for consistency

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i * 360) / count + rng.nextFloat(0, 10),  // ✅ Deterministic
    distance: 100 + rng.nextFloat(0, 200),              // ✅ Deterministic
    size: 3 + rng.nextFloat(0, 10),                     // ✅ Deterministic
  }))
}, [isMobile])
```

**Location:** `hooks/useLandingAnimation.ts:57-71`

---

### Example 2: Planet Orb Floating Animation

**Before (Hydration Risk):**
```typescript
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: 3 + Math.random() * 2,  // ❌ Different on server/client
    repeat: Infinity,
  }}
/>
```

**After (Hydration Safe):**
```typescript
import { seededRandom, hashString } from '@/lib/seeded-random'

const floatDuration = useMemo(() => {
  const seed = hashString(label) // Use label as unique seed
  const rng = seededRandom(seed)
  return 3 + rng.nextFloat(0, 2) // ✅ Deterministic based on label
}, [label])

<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: floatDuration,  // ✅ Same on server and client
    repeat: Infinity,
  }}
/>
```

**Why this works:**
- Each planet has a unique `label` ("Floor", "Wall", "Ceiling")
- `hashString(label)` creates a unique but deterministic seed
- Same label → Same seed → Same duration
- Different labels → Different seeds → Varied durations (visual variety)

**Location:** `components/animations/PlanetOrb.tsx:72-76`

---

### Example 3: Starfield Background

**Special Case: Client-Side Only with Persistence**

The Starfield component uses a hybrid approach:

1. **Client-Side Generation:** Stars are generated only on the client (in `useEffect`)
2. **Session Storage:** Star positions are saved to `sessionStorage`
3. **Seeded Random:** Uses deterministic random for initial generation

```typescript
useEffect(() => {
  const STORAGE_KEY = 'xplorium-starfield-config'

  try {
    const savedStars = sessionStorage.getItem(STORAGE_KEY)

    if (savedStars) {
      setStars(JSON.parse(savedStars)) // Use cached stars
    } else {
      // Generate new stars with seeded random
      const rng = seededRandom(99999)
      const newStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: rng.nextFloat(0, 100),   // ✅ Deterministic
        top: rng.nextFloat(0, 100),    // ✅ Deterministic
        size: rng.nextFloat(0.5, 2.5),
        // ...
      }))

      setStars(newStars)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newStars))
    }
  } catch (e) {
    // Fallback with same seeded random
  }
}, [])
```

**Why this works:**
- No server-side rendering of stars (generated in `useEffect`)
- Once generated, positions are cached
- Seeded random ensures consistent generation if cache is cleared
- No hydration mismatch because stars don't exist on initial server render

**Location:** `components/common/Starfield.tsx:41-80`

---

## Best Practices

### 1. Use Seeded Random in useMemo

```typescript
// ✅ CORRECT
const particles = useMemo(() => {
  const rng = seededRandom(12345)
  return generateParticles(rng)
}, [dependencies])
```

```typescript
// ❌ WRONG: Regenerates on every render
const particles = Array.from({ length: 10 }, () => ({
  x: Math.random() * 100
}))
```

### 2. Choose Appropriate Seeds

**Fixed Seed** - Same visual every time:
```typescript
const rng = seededRandom(12345)
```

**Component-Based Seed** - Unique per component instance:
```typescript
const seed = hashString(componentId)
const rng = seededRandom(seed)
```

**Index-Based Seed** - Unique per item in a list:
```typescript
items.map((item, index) => {
  const rng = seededRandom(10000 + index)
  return <Component key={index} randomValue={rng.next()} />
})
```

### 3. Pre-calculate Random Values

For values used in Framer Motion animations, pre-calculate them:

```typescript
// ✅ CORRECT: Pre-calculate in useMemo
const particles = useMemo(() => {
  const rng = seededRandom(12345)
  return particles.map(() => ({
    rotateStart: rng.nextFloat(0, 360),
    rotateEnd: rng.nextFloat(360, 720),
  }))
}, [])

// Use in animation
<motion.div
  animate={{ rotate: [particle.rotateStart, particle.rotateEnd] }}
/>
```

```typescript
// ❌ WRONG: Random in render
<motion.div
  animate={{ rotate: [Math.random() * 360, Math.random() * 360 + 360] }}
/>
```

### 4. Client-Side Only Generation

For non-critical visual elements, generate them client-side only:

```typescript
const [stars, setStars] = useState([])

useEffect(() => {
  const rng = seededRandom(99999)
  const newStars = generateStars(rng)
  setStars(newStars)
}, [])

// Stars won't exist on server render, preventing hydration issues
return <>{stars.map(star => <Star key={star.id} {...star} />)}</>
```

### 5. Disable Random When Motion is Reduced

Respect user's `prefers-reduced-motion` preference:

```typescript
const prefersReducedMotion = useReducedMotion()
const particles = useMemo(() => {
  if (prefersReducedMotion) {
    // Return fixed positions, no randomness
    return Array.from({ length: 10 }, (_, i) => ({
      x: i * 10,
      y: 50,
    }))
  }

  // Otherwise use seeded random
  const rng = seededRandom(12345)
  return Array.from({ length: 10 }, (_, i) => ({
    x: rng.nextFloat(0, 100),
    y: rng.nextFloat(0, 100),
  }))
}, [prefersReducedMotion])
```

---

## Fixed Components

All components have been updated to use seeded random:

### ✅ hooks/useLandingAnimation.ts
- **Fixed:** Starburst particles (seed: 12345)
- **Fixed:** Liquid drip particles (seed: 54321)
- **Before:** Used `Math.random()` for angle, distance, size, xOffset, width, height
- **After:** Uses `seededRandom()` with fixed seeds

### ✅ components/animations/PlanetOrb.tsx
- **Fixed:** Floating animation duration
- **Before:** `duration: 3 + Math.random() * 2`
- **After:** `duration: floatDuration` (calculated with `hashString(label)`)
- **Result:** Each planet (Floor, Wall, Ceiling) has unique but deterministic duration

### ✅ components/common/Starfield.tsx
- **Fixed:** Base stars (seed: 99999)
- **Fixed:** Section stars (seed: 88888)
- **Fixed:** Rotation values (pre-calculated in state)
- **Before:** Used `Math.random()` for position, size, opacity, delay, duration, rotation
- **After:** Uses `seededRandom()` + sessionStorage caching

---

## Testing for Hydration Issues

### Manual Testing

1. **Open DevTools Console**
   - Look for hydration warnings: "Warning: Prop `style` did not match"

2. **Check Network Tab**
   - Hard refresh (Cmd/Ctrl + Shift + R)
   - Look for content flashing/shifting on load

3. **Test with Slow Network**
   - Throttle connection to "Slow 3G"
   - Check if content flashes during hydration

### Automated Testing

Add to your E2E tests:

```typescript
test('should not have hydration mismatches', async ({ page }) => {
  // Listen for console errors
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Hydration')) {
      errors.push(msg.text())
    }
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  expect(errors).toHaveLength(0)
})
```

---

## Common Hydration Pitfalls

### ❌ Avoid These Patterns

1. **Math.random() in render:**
   ```typescript
   // BAD
   <div style={{ left: Math.random() * 100 }} />
   ```

2. **Date.now() in render:**
   ```typescript
   // BAD
   <div>Current time: {Date.now()}</div>
   ```

3. **Conditional rendering based on client-only APIs:**
   ```typescript
   // BAD
   {window.innerWidth > 768 && <Sidebar />}
   ```

4. **Different keys on server vs client:**
   ```typescript
   // BAD
   items.map(() => <div key={Math.random()} />)
   ```

### ✅ Use These Instead

1. **Seeded random:**
   ```typescript
   const rng = useMemo(() => seededRandom(12345), [])
   <div style={{ left: rng.nextFloat(0, 100) }} />
   ```

2. **Client-side state:**
   ```typescript
   const [time, setTime] = useState(Date.now())
   useEffect(() => {
     const interval = setInterval(() => setTime(Date.now()), 1000)
     return () => clearInterval(interval)
   }, [])
   ```

3. **useEffect for client-only logic:**
   ```typescript
   const [isMobile, setIsMobile] = useState(false)
   useEffect(() => {
     setIsMobile(window.innerWidth <= 768)
   }, [])
   ```

4. **Stable keys:**
   ```typescript
   items.map((item, i) => <div key={item.id || i} />)
   ```

---

## Related Documentation

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Phase 6
- [React Hydration Docs](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)

---

## Conclusion

The Xplorium application is now fully protected against hydration mismatches from random number generation:

**Key Achievements:**
- ✅ Created deterministic seeded random utility
- ✅ Fixed all `Math.random()` calls in components
- ✅ Pre-calculated animation values
- ✅ Used sessionStorage for client-side persistence
- ✅ Maintained visual variety while ensuring consistency

**Result:** Server and client renders always match, eliminating hydration errors and visual flashing during page load.
