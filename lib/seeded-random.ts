/**
 * Seeded Random Number Generator
 *
 * Provides deterministic pseudo-random numbers for hydration-safe animations.
 * Uses a simple Linear Congruential Generator (LCG) algorithm.
 *
 * This ensures server-side and client-side generate the same "random" values,
 * preventing React hydration mismatches.
 */

class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  /**
   * Generate next pseudo-random number between 0 and 1
   * @returns Number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    // Linear Congruential Generator
    // Using parameters from Numerical Recipes
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296
    return this.seed / 4294967296
  }

  /**
   * Generate pseudo-random integer between min and max
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Integer between min and max
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /**
   * Generate pseudo-random number between min and max
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Number between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  /**
   * Reset the seed
   * @param newSeed - New seed value
   */
  reset(seed: number): void {
    this.seed = seed
  }
}

/**
 * Create a seeded random number generator
 * @param seed - Seed value (use same seed for consistent results)
 * @returns SeededRandom instance
 *
 * @example
 * const rng = seededRandom(12345)
 * const value1 = rng.next() // 0.xxx (deterministic)
 * const value2 = rng.nextFloat(0, 100) // xx.xxx (deterministic)
 */
export function seededRandom(seed: number): SeededRandom {
  return new SeededRandom(seed)
}

/**
 * Generate a hash from a string to use as seed
 * @param str - String to hash
 * @returns Numeric hash value
 *
 * @example
 * const seed = hashString('my-component-id')
 * const rng = seededRandom(seed)
 */
export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
