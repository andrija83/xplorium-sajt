import { useState, useCallback, useEffect, useMemo } from 'react'
import { getParticleCount, ANIMATION_TIMING, PARTICLE_COLORS } from '@/constants/animations'

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
  const [showBrand, setShowBrand] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  // Memoized starburst particles
  const starburstParticles = useMemo(() => {
    if (!isAnimating) return []

    const count = getParticleCount(isMobile)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i * 360) / count + Math.random() * 10,
      distance: ANIMATION_TIMING.STARBURST_BASE_DISTANCE + Math.random() * (ANIMATION_TIMING.STARBURST_MAX_DISTANCE - ANIMATION_TIMING.STARBURST_BASE_DISTANCE),
      size: 3 + Math.random() * 10,
      colorIndex: i % PARTICLE_COLORS.STARBURST.length,
    }))
  }, [isAnimating, isMobile])

  // Memoized liquid drip particles
  const liquidDripConfig = useMemo(() => {
    const letterCount = "plorium".length
    return Array.from({ length: letterCount }, (_, letterIndex) => ({
      letterIndex,
      drips: Array.from({ length: ANIMATION_TIMING.LIQUID_MORPH_DRIP_COUNT }, (_, dripIndex) => ({
        id: dripIndex,
        xOffset: (Math.random() - 0.5) * 40,
        width: 4 + Math.random() * 6,
        height: 8 + Math.random() * 80,
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
