import { useState, useCallback, useEffect, useMemo } from 'react'
import { getParticleCount, ANIMATION_TIMING, PARTICLE_COLORS } from '@/constants/animations'
import { seededRandom } from '@/lib/seeded-random'

/**
 * useLandingAnimation Hook
 *
 * Manages the X logo animation state and particle configurations
 * for the Xplorium landing page initial animation sequence
 *
 * @returns Object containing animation state and configurations
 */
export function useLandingAnimation() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showBrand, setShowBrand] = useState(false) // Always start false to prevent hydration mismatch
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for deep link AFTER hydration to prevent mismatch
  useEffect(() => {
    // If URL has section param, skip X logo animation and show brand immediately
    const hasDeepLink = new URLSearchParams(window.location.search).has('section')
    if (hasDeepLink) {
      setShowBrand(true)
    }
  }, [])

  // Detect reduced motion preference and mobile device
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)

    // Check if device is mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Handle X logo click
  const handleXClick = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true)
    }
  }, [isAnimating])

  // Handle brand reveal with proper cleanup
  useEffect(() => {
    if (!isAnimating) return

    const timer = setTimeout(() => {
      setShowBrand(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [isAnimating])

  // Memoized starburst particles with seeded random for hydration safety
  const starburstParticles = useMemo(() => {
    if (!isAnimating) return []

    const count = getParticleCount(isMobile)
    const rng = seededRandom(12345) // Consistent seed for deterministic results

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i * 360) / count + rng.nextFloat(0, 10),
      distance: ANIMATION_TIMING.STARBURST_BASE_DISTANCE + rng.nextFloat(0, ANIMATION_TIMING.STARBURST_MAX_DISTANCE - ANIMATION_TIMING.STARBURST_BASE_DISTANCE),
      size: 3 + rng.nextFloat(0, 10),
      colorIndex: i % PARTICLE_COLORS.STARBURST.length,
    }))
  }, [isAnimating, isMobile])

  // Memoized liquid drip particles with seeded random for hydration safety
  const liquidDripConfig = useMemo(() => {
    const letterCount = "plorium".length
    const rng = seededRandom(54321) // Different seed for variety

    return Array.from({ length: letterCount }, (_, letterIndex) => ({
      letterIndex,
      drips: Array.from({ length: ANIMATION_TIMING.LIQUID_MORPH_DRIP_COUNT }, (_, dripIndex) => ({
        id: dripIndex,
        xOffset: (rng.next() - 0.5) * 40,
        width: 4 + rng.nextFloat(0, 6),
        height: 8 + rng.nextFloat(0, 80),
        colorIndex: dripIndex % PARTICLE_COLORS.LIQUID_DRIP.length,
      }))
    }))
  }, [])

  return {
    // State
    isAnimating,
    showBrand,
    prefersReducedMotion,
    isMobile,

    // Handlers
    handleXClick,

    // Configurations
    starburstParticles,
    liquidDripConfig,
  }
}
