"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronDown } from "lucide-react"
import {
  ANIMATION_TIMING,
  ANIMATION_EASING,
  PARTICLE_COLORS,
  NEON_COLORS,
  STYLE_CONSTANTS,
  getParticleCount,
} from "@/constants/animations"
import { PenStrokeReveal, TypewriterText, PlanetOrb } from "@/components/animations"
import { Starfield } from "@/components/common/Starfield"
import { AuthButtons } from "@/components/common/AuthButtons"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

// Dynamic imports for heavy feature components (code-splitting)
const SignInModal = lazy(() => import("@/components/auth/SignInModal").then(m => ({ default: m.SignInModal })))
const SignUpModal = lazy(() => import("@/components/auth/SignUpModal").then(m => ({ default: m.SignUpModal })))
const IgraonicaSection = lazy(() => import("@/features/igraonica/IgraonicaSection").then(m => ({ default: m.IgraonicaSection })))
const SensorySection = lazy(() => import("@/features/sensory/SensorySection").then(m => ({ default: m.SensorySection })))
const CafeSection = lazy(() => import("@/features/cafe/CafeSection").then(m => ({ default: m.CafeSection })))
const ProfileSection = lazy(() => import("@/components/profile/ProfileSection").then(m => ({ default: m.ProfileSection })))

/**
 * XPLORIUM LANDING PAGE
 *
 * Main Sections:
 * 1. Initial X Logo Click Animation
 * 2. Main Navigation Menu (Cafe, Sensory, Igraonica) with Neon Effects
 * 3. Cafe Section - Glass frame submenu
 * 4. Sensory Section - Planet orb navigation
 * 5. Igraonica Section - Description with typewriter effect
 *
 * Common Tailwind CSS Classes Used:
 * - Spacing: px-4 (padding-x 1rem), py-2 (padding-y 0.5rem), gap-6 (gap 1.5rem)
 * - Sizing: w-full (width 100%), h-screen (height 100vh), max-w-5xl (max-width 64rem)
 * - Position: absolute, relative, fixed, inset-0 (top/right/bottom/left: 0)
 * - Flex: flex, flex-col, items-center, justify-center
 * - Text: text-white, text-4xl, font-['Great_Vibes'], tracking-tight
 * - Effects: backdrop-blur-sm, bg-black/40, opacity-80, rounded-lg
 * - Responsive: sm: (640px+), md: (768px+), lg: (1024px+)
 *
 * Motion/Animation:
 * - initial: Starting state before animation
 * - animate: End state after animation
 * - transition: Animation timing (duration, delay, ease)
 * - whileHover/whileTap: Interactive states
 */

/**
 * ====================================
 * MAIN LANDING COMPONENT
 * ====================================
 */
export default function Landing() {
  // ========== STATE MANAGEMENT ==========

  /**
   * isAnimating: Controls X logo rotation/shrink animation
   * - true: Logo is animating (prevents multiple clicks)
   * - false: Logo is idle and clickable
   */
  const [isAnimating, setIsAnimating] = useState(false)

  /**
   * showBrand: Controls whether to show brand name + navigation menu
   * - false: Show only X logo (initial state)
   * - true: Show "Xplorium" brand + navigation menu (after X click)
   */
  const [showBrand, setShowBrand] = useState(false)

  /**
   * activeView: Tracks which main section is active
   * - null: Main menu visible
   * - "cafe": Cafe section active
   * - "discover": Sensory section active
   * - "igraonica": Playground section active
   */
  const [activeView, setActiveView] = useState<string | null>(null)

  /**
   * sensorySubView: Tracks which sensory subsection is active
   * - null: Showing planet orb menu
   * - "floor"/"wall"/"ceiling": Specific sensory area
   */
  const [sensorySubView, setSensorySubView] = useState<string | null>(null)

  /**
   * cafeSubView: Tracks which cafe subsection is active
   * - null: Showing glass frame menu
   * - "meni"/"zakup"/"radno"/"kontakt": Specific cafe submenu
   */
  const [cafeSubView, setCafeSubView] = useState<string | null>(null)

  /**
   * Modal state management following Mobiscroll pattern
   * - isSignInOpen: Controls Sign In modal visibility
   * - isSignUpOpen: Controls Sign Up modal visibility
   */
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)

  // ========== PERFORMANCE & ACCESSIBILITY HOOKS ==========

  /**
   * prefersReducedMotion: Detects if user prefers reduced motion
   * - Used to disable or simplify animations for accessibility
   */
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  /**
   * isMobile: Detects if device is mobile for performance optimization
   * - Used to reduce particle count on mobile devices
   */
  const [isMobile, setIsMobile] = useState(false)

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

  // ========== EVENT HANDLERS (MEMOIZED) ==========

  /**
   * handleXClick: Handles initial X logo click
   * - Prevents multiple clicks during animation
   * - Triggers shrink/rotate animation
   * - Shows brand after 800ms delay
   */
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

  /**
   * goBackToMenu: Handles back button navigation
   * - If in subview, goes back to section menu
   * - If in section, goes back to main menu
   * - Creates breadcrumb-like navigation
   */
  const goBackToMenu = useCallback(() => {
    if (sensorySubView) {
      setSensorySubView(null)
    } else if (cafeSubView) {
      setCafeSubView(null)
    } else {
      setActiveView(null)
    }
  }, [sensorySubView, cafeSubView])

  /**
   * Keyboard navigation support
   * - Escape key: Go back to previous view
   * - Improves accessibility for keyboard-only users
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key - go back
      if (e.key === 'Escape' && activeView) {
        e.preventDefault()
        goBackToMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeView, goBackToMenu])

  /**
   * navigateToSection: Navigates to main section
   * - Sets the active view (cafe/discover/igraonica)
   * - Resets any active subviews to null
   * @param section - The section identifier
   */
  const navigateToSection = useCallback((section: string) => {
    setActiveView(section)
    setSensorySubView(null)
    setCafeSubView(null)
  }, [])

  /**
   * handleSignIn: Opens the Sign In modal
   * Following Mobiscroll pattern: setState(true)
   */
  const handleSignIn = useCallback(() => {
    setIsSignInOpen(true)
  }, [])

  /**
   * handleSignUp: Opens the Sign Up modal
   * Following Mobiscroll pattern: setState(true)
   */
  const handleSignUp = useCallback(() => {
    setIsSignUpOpen(true)
  }, [])

  /**
   * handleSwitchToSignUp: Switches from Sign In to Sign Up
   * Ensures only one modal is open at a time
   */
  const handleSwitchToSignUp = useCallback(() => {
    setIsSignInOpen(false)
    setIsSignUpOpen(true)
  }, [])

  /**
   * handleSwitchToSignIn: Switches from Sign Up to Sign In
   * Ensures only one modal is open at a time
   */
  const handleSwitchToSignIn = useCallback(() => {
    setIsSignUpOpen(false)
    setIsSignInOpen(true)
  }, [])

  /**
   * handleProfileClick: Switches view to Profile section
   */
  const handleProfileClick = useCallback(() => {
    setActiveView("profile")
    setSensorySubView(null)
    setCafeSubView(null)
  }, [])

  // ========== DATA STRUCTURES (MEMOIZED) ==========

  /**
   * tabs: Main navigation menu items with NEON GLOW EFFECTS
   * Positioned around the brand logo after X click
   * - Cafe: Left side (30% from top)
   * - Sensory: Right side (30% from top)
   * - Igraonica: Bottom center (8% from bottom)
   * Each has PenStrokeReveal animation on initial load
   * Memoized to prevent recreation on every render
   */
  const tabs = useMemo(() => [
    {
      label: "Cafe",
      section: "cafe",
      position: { top: "30%", left: "8%", transform: "translateY(-50%)" },
    },
    {
      label: "Sensory",
      section: "discover",
      position: { top: "30%", right: "8%", transform: "translateY(-50%)" },
    },
    {
      label: "Igraonica",
      section: "igraonica",
      position: { bottom: "4%", left: "50%", transform: "translateX(-50%)" },
    },
  ], [])

  /**
   * starburstParticles: Memoized starburst explosion particles
   * Prevents hydration mismatches from Math.random() in render
   * Regenerates when isAnimating changes
   */
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

  /**
   * liquidDripConfig: Memoized liquid drip particles configuration
   * Prevents hydration mismatches from Math.random() in render
   * Creates configurations for all 8 letters in "plorium" × 5 drips per letter
   */
  const liquidDripConfig = useMemo(() => {
    const letterCount = "plorium".length; // 8 letters
    return Array.from({ length: letterCount }, (_, letterIndex) => ({
      letterIndex,
      drips: Array.from({ length: ANIMATION_TIMING.LIQUID_MORPH_DRIP_COUNT }, (_, dripIndex) => ({
        id: dripIndex,
        xOffset: (Math.random() - 0.5) * 40,
        width: 4 + Math.random() * 6,
        height: 8 + Math.random() * 80,
        colorIndex: dripIndex % PARTICLE_COLORS.LIQUID_DRIP.length,
      }))
    }));
  }, [])


  /**
   * cafeGalleryImages: Placeholder gallery images for Cafe section
   * Array of 6 images for cafe submenu galleries
   * Used in Meni, Zakup, Radno sections (NOT Kontakt - has map)
   */
  const cafeGalleryImages = [
    { id: 1, query: "modern cozy cafe interior with comfortable seating" },
    { id: 2, query: "fresh coffee and pastries on cafe table" },
    { id: 3, query: "parents relaxing in cafe while kids play" },
    { id: 4, query: "healthy snacks and beverages in cafe" },
    { id: 5, query: "bright cafe space with natural lighting" },
    { id: 6, query: "comfortable lounge area in family cafe" },
  ]

  // ========== JSX RENDER ==========

  return (
    // Main container: Full screen with black background
    // min-h-screen: Minimum height 100vh
    // overflow-hidden: Prevents scrollbars from showing
    <div className="min-h-screen w-full bg-black overflow-hidden">
      {/* ========== STARFIELD BACKGROUND ========== */}
      {/* Fixed layer behind all content with 100+ animated stars */}
      <Starfield activeView={activeView} />

      {/* ========== AUTH BUTTONS ========== */}
      {/* Only appear after brand reveal (showBrand is true) */}
      {/* Cool animation: slide from top-right with rotation and glow */}
      <AnimatePresence>
        {showBrand && (
          <motion.div
            className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50"
            initial={{
              opacity: 0,
              x: 100,
              y: -100,
              rotate: 45,
              scale: 0.5,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: 100,
              y: -100,
              rotate: 45,
              scale: 0.5,
            }}
            transition={{
              duration: 0.8,
              delay: 1.2, // Appears after navigation buttons
              ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
            }}
          >
            {/* Glowing ring animation around buttons */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 1],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: 1.2,
                ease: "easeOut",
              }}
            />
            <AuthButtons
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
              onProfileClick={handleProfileClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== BACK BUTTON ========== */}
      {/* Only shows when inside a section (activeView is not null) */}
      {/* AnimatePresence: Handles exit animations */}
      {/* fixed: Stays in top-left corner when scrolling */}
      {/* z-50: Highest z-index to stay above all content */}
      <AnimatePresence>
        {activeView && (
          <motion.button
            onClick={goBackToMenu}
            aria-label="Go back to main menu"
            className="fixed top-6 left-6 sm:top-8 sm:left-8 z-50 p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white transition-all duration-300 flex items-center gap-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            {/* "Back" text hidden on mobile (sm breakpoint) */}
            <span className="text-sm font-light hidden sm:inline">Back</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ========== MAIN CONTENT CONTAINER ========== */}
      {/* Centers all content vertically and horizontally */}
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full">
          {/* AnimatePresence mode="wait": Waits for exit animation before showing next */}
          <AnimatePresence mode="wait">
            {/* ========== INITIAL X LOGO STATE ========== */}
            {/* Shows before clicking X - first thing user sees */}
            {!showBrand ? (
              <motion.button
                key="x-button"
                onClick={handleXClick}
                className="cursor-pointer focus:outline-none group relative"
                whileHover={!isAnimating ? { scale: 1.05 } : {}}
                whileTap={!isAnimating ? { scale: 0.95 } : {}}
                aria-label="Open Xplorium main menu"
                role="button"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: isAnimating ? 0.4 : 1, // Shrinks to 40% when clicked
                  rotate: isAnimating ? 180 : 0, // Rotates 180° when clicked
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {/* Starburst Explosion - Triggers on click */}
                {isAnimating && !prefersReducedMotion && Array.from({ length: ANIMATION_TIMING.STARBURST_LIGHT_RAY_COUNT }, (_, i) => {
                  const angle = (i * 360) / ANIMATION_TIMING.STARBURST_LIGHT_RAY_COUNT;
                  const color = PARTICLE_COLORS.STARBURST_GRADIENTS[i % PARTICLE_COLORS.STARBURST_GRADIENTS.length];

                  return (
                    <motion.div
                      key={`starburst-${i}`}
                      className={`absolute w-1 bg-gradient-to-r ${color} rounded-full`}
                      style={{
                        ...STYLE_CONSTANTS.CENTER_POSITION,
                        transformOrigin: "0 50%",
                        rotate: `${angle}deg`,
                        height: "2px",
                        willChange: "transform, opacity",
                      }}
                      initial={{
                        width: 0,
                        opacity: 0,
                        x: 0,
                      }}
                      animate={{
                        width: [0, ANIMATION_TIMING.STARBURST_LIGHT_RAY_MIN_WIDTH, ANIMATION_TIMING.STARBURST_LIGHT_RAY_MAX_WIDTH],
                        opacity: [0, 1, 0],
                        x: [0, 0, 0],
                      }}
                      transition={{
                        duration: ANIMATION_TIMING.STARBURST_DURATION,
                        ease: ANIMATION_EASING.EASE_OUT,
                        delay: i * ANIMATION_TIMING.STARBURST_LIGHT_RAY_DELAY,
                      }}
                    />
                  );
                })}

                {/* Star particles for explosion */}
                {isAnimating && !prefersReducedMotion && starburstParticles.map((particle, i) => {
                  const color = PARTICLE_COLORS.STARBURST[particle.colorIndex];

                  return (
                    <motion.div
                      key={`star-${particle.id}`}
                      className={`absolute ${color} rounded-full`}
                      style={{
                        ...STYLE_CONSTANTS.CENTER_POSITION,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        marginLeft: "-2px",
                        marginTop: "-2px",
                        boxShadow: STYLE_CONSTANTS.PARTICLE_BASE_SHADOW,
                        willChange: "transform, opacity",
                      }}
                      initial={{
                        x: 0,
                        y: 0,
                        scale: 0,
                        opacity: 0,
                      }}
                      animate={{
                        x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                        y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: ANIMATION_TIMING.STARBURST_DURATION + 0.1,
                        ease: ANIMATION_EASING.EASE_OUT,
                        delay: i * ANIMATION_TIMING.STARBURST_STAR_DELAY,
                      }}
                    />
                  );
                })}

                {/* X Logo Image */}
                {/* Sizes: 96px→128px→160px→192px (mobile→desktop) */}
                {/* group-hover:brightness-125: Brightens on hover */}
                <div className="rounded-3xl overflow-hidden relative z-10">
                  <img
                    src="/crystal-x-logo.jpg"
                    alt="X Logo"
                    className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 group-hover:brightness-125 transition-all duration-300"
                  />
                </div>
              </motion.button>
            ) : !activeView ? (
              <motion.div
                key="brand"
                className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl aspect-square flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Brand Logo + Tagline (Center) */}
                {/* z-20: Above navigation items */}
                <motion.div
                  className="absolute flex flex-col items-center gap-2 sm:gap-3 z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* "Xplorium" branding with X logo */}
                  <div className="flex items-center">
                    {/* X logo - spins back from 180° to 0° */}
                    <motion.div
                      initial={{ rotate: 180, scale: 0.4 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      className="-mr-2 sm:-mr-3 md:-mr-4"
                    >
                      <div className="rounded-2xl overflow-hidden">
                        <img
                          src="/crystal-x-logo.jpg"
                          alt="X Logo"
                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                        />
                      </div>
                    </motion.div>

                    {/* "plorium" text (X + plorium = Xplorium) */}
                    <motion.h1
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white tracking-tight relative overflow-visible"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      {"plorium".split("").map((char, index) => {
                        return (
                          <span key={index} className="relative inline-block">
                            {/* Letter with liquid morph animation */}
                            <motion.span
                              className="inline-block relative"
                              initial={{
                                opacity: 0,
                                scaleY: 0,
                                scaleX: 1.5,
                                y: -50,
                                filter: "blur(20px)",
                              }}
                              animate={{
                                opacity: 1,
                                scaleY: 1,
                                scaleX: 1,
                                y: 0,
                                filter: "blur(0px)",
                              }}
                              transition={{
                                duration: ANIMATION_TIMING.LIQUID_MORPH_DURATION,
                                delay: ANIMATION_TIMING.LIQUID_MORPH_BASE_DELAY + index * ANIMATION_TIMING.LIQUID_MORPH_LETTER_DELAY,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              {/* Multiple colored layers for liquid effect */}
                              <motion.span
                                className="absolute inset-0 text-cyan-400"
                                initial={{ x: -3, y: -3, opacity: 0 }}
                                animate={{ x: 0, y: 0, opacity: 0.3 }}
                                transition={{
                                  duration: 0.6,
                                  delay: 0.4 + index * 0.1,
                                }}
                              >
                                {char}
                              </motion.span>
                              <motion.span
                                className="absolute inset-0 text-purple-400"
                                initial={{ x: 3, y: 3, opacity: 0 }}
                                animate={{ x: 0, y: 0, opacity: 0.3 }}
                                transition={{
                                  duration: 0.6,
                                  delay: 0.4 + index * 0.1 + 0.05,
                                }}
                              >
                                {char}
                              </motion.span>
                              <motion.span
                                className="relative z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                  duration: 0.4,
                                  delay: 0.4 + index * 0.1 + 0.2,
                                }}
                              >
                                {char}
                              </motion.span>
                            </motion.span>

                            {/* Liquid drip particles */}
                            {liquidDripConfig[index]?.drips.map((dripConfig) => {
                              const dripColor = PARTICLE_COLORS.LIQUID_DRIP[dripConfig.colorIndex];

                              return (
                                <motion.div
                                  key={`drip-${index}-${dripConfig.id}`}
                                  className={`absolute ${dripColor} rounded-full blur-sm pointer-events-none`}
                                  style={{
                                    left: "50%",
                                    top: "0%",
                                    width: `${dripConfig.width}px`,
                                    height: `${dripConfig.height}px`,
                                  }}
                                  initial={{
                                    x: dripConfig.xOffset,
                                    y: -30,
                                    opacity: 0,
                                    scaleY: 0.5,
                                  }}
                                  animate={{
                                    x: dripConfig.xOffset,
                                    y: 100,
                                    opacity: [0, 0.8, 0],
                                    scaleY: [0.5, 2, 0.2],
                                  }}
                                  transition={{
                                    duration: ANIMATION_TIMING.LIQUID_MORPH_DRIP_DURATION,
                                    delay: ANIMATION_TIMING.LIQUID_MORPH_BASE_DELAY + index * ANIMATION_TIMING.LIQUID_MORPH_LETTER_DELAY + dripConfig.id * ANIMATION_TIMING.LIQUID_MORPH_DRIP_DELAY,
                                    ease: [0.4, 0, 0.6, 1],
                                  }}
                                />
                              );
                            })}
                          </span>
                        );
                      })}
                    </motion.h1>
                  </div>

                  {/* Tagline */}
                  <motion.p
                    className="text-white/70 text-xs sm:text-sm md:text-base font-light tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    Explore the Extraordinary
                  </motion.p>
                </motion.div>

                {/* ========== NAVIGATION MENU WITH NEON EFFECTS ========== */}
                {/* Three navigation items positioned around the brand */}
                {/* Each with unique neon color: Cafe(cyan), Sensory(purple), Igraonica(pink) */}
                {tabs.map((tab, index) => {
                  // Neon color definitions for each section
                  const neonColors = {
                    cafe: { main: "#22d3ee", glow: "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee, 0 0 40px #06b6d4" },
                    discover: { main: "#a855f7", glow: "0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7, 0 0 40px #7c3aed" },
                    igraonica: { main: "#ec4899", glow: "0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899, 0 0 40px #db2777" },
                  }
                  const color = neonColors[tab.section as keyof typeof neonColors]

                  return (
                    <motion.button
                      key={tab.section}
                      aria-label={`Navigate to ${tab.label} section`}
                      className="absolute text-4xl sm:text-5xl md:text-6xl lg:text-7xl cursor-pointer z-10 px-6 py-6 leading-relaxed font-['Great_Vibes']"
                      style={{
                        ...tab.position, // Positioned around brand (left/right/bottom)
                        color: color.main, // Neon text color
                        textShadow: color.glow, // Multi-layer glow effect
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.15 }} // Staggered appearance
                      whileHover={{
                        // Intensifies glow on hover (doubles blur distances)
                        textShadow: color.glow.replace(/40px/g, "80px").replace(/30px/g, "60px").replace(/20px/g, "40px").replace(/10px/g, "20px"),
                      }}
                      onClick={() => navigateToSection(tab.section)}
                    >
                      {/* PenStrokeReveal: Handwriting animation for each character */}
                      <PenStrokeReveal text={tab.label} delay={0.8 + index * 0.15} />
                    </motion.button>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                key={activeView}
                className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner /></div>}>
                  {/* ========== CAFE SECTION ========== */}
                  {/* Glass frame menu with neon-glowing submenu items */}
                  {activeView === "cafe" && (
                    <CafeSection
                      cafeSubView={cafeSubView}
                      setCafeSubView={setCafeSubView}
                    />
                  )}

                  {/* ========== SENSORY SECTION ========== */}
                  {/* Planet orb navigation with Floor/Wall/Ceiling options */}
                  {activeView === "discover" && (
                    <SensorySection
                      sensorySubView={sensorySubView}
                      setSensorySubView={setSensorySubView}
                    />
                  )}

                  {/* ========== IGRAONICA SECTION ========== */}
                  {/* Interactive playground section */}
                  {activeView === "igraonica" && <IgraonicaSection />}

                  {/* ========== PROFILE SECTION ========== */}
                  {activeView === "profile" && <ProfileSection />}
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          {!isAnimating && !showBrand && (
            <motion.p
              className="absolute top-[calc(50%+8rem)] sm:top-[calc(50%+10rem)] md:top-[calc(50%+12rem)] lg:top-[calc(50%+14rem)] text-white/50 text-xs sm:text-sm font-light tracking-wider text-center px-4 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Click the X to begin
            </motion.p>
          )}

          {showBrand && !activeView && (
            <motion.p
              className="absolute bottom-8 sm:bottom-12 text-white/50 text-xs sm:text-sm font-light tracking-wider text-center px-4 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              Click a segment to explore
            </motion.p>
          )}
        </div>
      </div>

      {/* ========== AUTH MODALS ========== */}
      {/* Following Mobiscroll pattern for popup management */}
      <Suspense fallback={null}>
        <SignInModal
          isOpen={isSignInOpen}
          onClose={() => setIsSignInOpen(false)}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
        <SignUpModal
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      </Suspense>
    </div>
  )
}
