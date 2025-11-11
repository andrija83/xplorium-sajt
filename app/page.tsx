"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronDown } from "lucide-react"

/**
 * ASDASDASDASDASD
 * XPLORIUM LANDING PAGE
 * asdasdasdasdas
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
 * HandwritingText Component
 * Creates a reveal animation using clipPath (horizontal wipe effect)
 * - inline-block: Makes element behave as inline with block properties
 * - relative: Positioning context for absolute children
 * - px-4 py-2: Padding horizontal 1rem, vertical 0.5rem
 * - clipPath animation: Reveals text from left to right
 */
const HandwritingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  return (
    <motion.span
      className="inline-block relative px-4 py-2"
      initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{
        duration: 3,
        delay: delay,
        ease: [0.22, 1, 0.36, 1],
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

/**
 * CharacterReveal Component
 * Smooth character-by-character reveal with slide from left
 * - inline-block: Container for character animations
 * - opacity: 0→1: Fade in effect
 * - x: -10→0: Slide in from left (10px)
 * - delay: Staggered timing for sequential reveal
 * - \u00A0: Non-breaking space for proper spacing
 */
const CharacterReveal = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const characters = text.split("")

  return (
    <span className="inline-block">
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          style={{ display: char === " " ? "inline" : "inline-block" }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

/**
 * PenStrokeReveal Component (CURRENTLY USED ON NAVIGATION)
 * Mimics handwriting pen strokes - characters pop in with rotation
 * - inline-block: Container for animated characters
 * - origin-bottom-left: Transform origin point for natural pen stroke
 * - opacity: 0→1: Fade in
 * - scale: 0.3→1: Grows from 30% to 100% size
 * - rotate: -15°→0°: Rotates from tilted to upright
 * - delay + index * 0.20: 0.2s between each character (slower = more dramatic)
 * - ease: Bouncy curve for playful pen landing effect
 */
const PenStrokeReveal = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const characters = text.split("")

  return (
    <span className="inline-block">
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block origin-bottom-left"
          style={{ display: char === " " ? "inline" : "inline-block" }}
          initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.20,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

/**
 * TypewriterText Component (CURRENTLY USED IN IGRAONICA DESCRIPTION)
 * Classic typewriter effect - adds one character at a time
 * - useState: Manages displayed text, current index, and start state
 * - useEffect #1: Delays start of typing by 'delay' seconds
 * - useEffect #2: Adds characters one by one based on 'speed' (ms per char)
 * - speed=30: 30ms between characters (faster = lower number)
 * - Returns plain span with progressively revealed text
 */
const TypewriterText = ({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true)
    }, delay * 1000)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, hasStarted, text, speed])

  return <span>{displayedText}</span>
}

/**
 * HandwritingEffect Component (NOT CURRENTLY USED - ALTERNATIVE OPTION)
 * Character animation with slight drop and rotation
 * - inline: Container spans inline
 * - inline-block: Each word is inline-block
 * - mr-2: Margin-right 0.5rem for word spacing
 * - opacity: 0→1: Fade in
 * - y: 10→0: Slides up from 10px below
 * - rotate: -5°→0°: Slight rotation correction
 * - totalDelay: Calculated for sequential word+character reveal
 */
const HandwritingEffect = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const words = text.split(" ")

  return (
    <span className="inline">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-2">
          {word.split("").map((char, charIndex) => {
            const totalDelay = delay + (wordIndex * word.length + charIndex) * 0.03
            return (
              <motion.span
                key={charIndex}
                className="inline-block"
                initial={{ opacity: 0, y: 10, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  duration: 0.2,
                  delay: totalDelay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {char}
              </motion.span>
            )
          })}
        </span>
      ))}
    </span>
  )
}

/**
 * PlanetOrb Component (USED IN SENSORY SECTION)
 * Creates neon ring orbs with glow effects (inspired by planetss.jpg)
 * Size classes:
 * - sm: 24-28 (6rem-7rem)
 * - md: 32-40 (8rem-10rem)
 * - lg: 40-48 (10rem-12rem)
 * Features:
 * - Multiple concentric neon rings
 * - Strong outer glow
 * - Semi-transparent glass center
 * - Floating animation (y: 0→-10→0)
 */
const PlanetOrb = ({
  label,
  color,
  size = "md",
  position,
  delay = 0,
  onClick,
}: {
  label: string
  color: string
  size?: "sm" | "md" | "lg"
  position: React.CSSProperties
  delay?: number
  onClick: () => void
}) => {
  const sizeClasses = {
    sm: "w-24 h-24 sm:w-28 sm:h-28",
    md: "w-32 h-32 sm:w-40 sm:h-40",
    lg: "w-40 h-40 sm:w-48 sm:h-48",
  }

  const neonColors = {
    yellow: { main: "#fbbf24", glow: "rgba(251, 191, 36, 1)", dark: "rgba(251, 191, 36, 0.3)" },
    orange: { main: "#fb923c", glow: "rgba(251, 146, 60, 1)", dark: "rgba(251, 146, 60, 0.3)" },
    green: { main: "#10b981", glow: "rgba(16, 185, 129, 1)", dark: "rgba(16, 185, 129, 0.3)" },
    blue: { main: "#22d3ee", glow: "rgba(34, 211, 238, 1)", dark: "rgba(34, 211, 238, 0.3)" },
    purple: { main: "#a855f7", glow: "rgba(168, 85, 247, 1)", dark: "rgba(168, 85, 247, 0.3)" },
    pink: { main: "#ec4899", glow: "rgba(236, 72, 153, 1)", dark: "rgba(236, 72, 153, 0.3)" },
  }

  const colors = neonColors[color as keyof typeof neonColors]

  return (
    <motion.button
      className={`absolute ${sizeClasses[size]} rounded-full cursor-pointer group`}
      style={position}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Outer massive glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 40px 15px ${colors.glow}, 0 0 80px 30px ${colors.glow}, 0 0 120px 45px ${colors.dark}`,
            filter: "blur(8px)",
          }}
        />

        {/* Outer ring 1 */}
        <div
          className="absolute inset-0 rounded-full border-[3px]"
          style={{
            borderColor: colors.main,
            boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.dark}`,
          }}
        />

        {/* Outer ring 2 */}
        <div
          className="absolute inset-[6px] rounded-full border-[2px]"
          style={{
            borderColor: colors.main,
            boxShadow: `0 0 15px ${colors.glow}, inset 0 0 15px ${colors.dark}`,
          }}
        />

        {/* Inner ring */}
        <div
          className="absolute inset-[12px] rounded-full border-[2px]"
          style={{
            borderColor: colors.main,
            boxShadow: `0 0 10px ${colors.glow}`,
          }}
        />

        {/* Glass center with radial gradient */}
        <div
          className="absolute inset-[18px] rounded-full overflow-hidden"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${colors.dark}, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.8))`,
            backdropFilter: "blur(2px)",
          }}
        >
          {/* Subtle light reflection */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)`,
            }}
          />

          {/* Label text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-['Great_Vibes'] text-center px-2"
              style={{
                textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.8)`,
              }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Hover glow enhancement */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `0 0 60px 20px ${colors.glow}`,
          }}
        />
      </motion.div>
    </motion.button>
  )
}

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
   * sectionStars: Colored stars that appear when entering a section
   * - Generated when activeView changes
   * - Color matches the active section (cafe=cyan, discover=purple, igraonica=pink)
   */
  const [sectionStars, setSectionStars] = useState<Array<{
    id: number
    left: number
    top: number
    size: number
    opacity: number
    delay: number
    duration: number
    color: string
  }>>([])

  // ========== EVENT HANDLERS ==========

  /**
   * handleXClick: Handles initial X logo click
   * - Prevents multiple clicks during animation
   * - Triggers shrink/rotate animation
   * - Shows brand after 800ms delay
   */
  const handleXClick = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setTimeout(() => {
        setShowBrand(true)
      }, 800)
    }
  }

  /**
   * navigateToSection: Navigates to main section
   * - Sets the active view (cafe/discover/igraonica)
   * - Resets any active subviews to null
   * @param section - The section identifier
   */
  const navigateToSection = (section: string) => {
    setActiveView(section)
    setSensorySubView(null)
    setCafeSubView(null)
  }

  /**
   * goBackToMenu: Handles back button navigation
   * - If in subview, goes back to section menu
   * - If in section, goes back to main menu
   * - Creates breadcrumb-like navigation
   */
  const goBackToMenu = () => {
    if (sensorySubView) {
      setSensorySubView(null)
    } else if (cafeSubView) {
      setCafeSubView(null)
    } else {
      setActiveView(null)
    }
  }

  /**
   * useEffect: Generate colored stars when entering a section
   * - 50 additional stars per section
   * - Color matches section theme (cafe=cyan, sensory=purple, igraonica=pink)
   * - Clears stars when returning to main menu
   */
  useEffect(() => {
    if (activeView) {
      // Determine color based on active section
      const sectionColors = {
        cafe: "#22d3ee",        // Cyan
        discover: "#a855f7",     // Purple
        igraonica: "#ec4899",    // Pink
      }
      const color = sectionColors[activeView as keyof typeof sectionColors] || "#ffffff"

      // Generate 50 new stars with section color
      const newStars = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1000, // Offset ID to avoid conflicts with base stars
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.7,
        delay: Math.random() * 0.5,
        duration: Math.random() * 3 + 2,
        color: color,
      }))
      setSectionStars(newStars)
    } else {
      // Clear section stars when returning to main menu
      setSectionStars([])
    }
  }, [activeView])

  // ========== DATA STRUCTURES ==========

  /**
   * tabs: Main navigation menu items with NEON GLOW EFFECTS
   * Positioned around the brand logo after X click
   * - Cafe: Left side (30% from top)
   * - Sensory: Right side (30% from top)
   * - Igraonica: Bottom center (8% from bottom)
   * Each has PenStrokeReveal animation on initial load
   */
  const tabs = [
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
  ]

  /**
   * sensoryPlanets: Planet orb navigation for Sensory section
   * Three floating orbs with different sizes and colors
   * - Floor: Purple, medium, top-left
   * - Wall: Orange, large, right-center (biggest)
   * - Ceiling: Pink, small, bottom-center
   * Uses PlanetOrb component with glow effects
   */
  const sensoryPlanets = [
    {
      label: "Floor",
      section: "floor",
      color: "purple",
      size: "md" as const,
      position: { top: "20%", left: "15%", transform: "translate(-50%, -50%)" },
    },
    {
      label: "Wall",
      section: "wall",
      color: "orange",
      size: "lg" as const,
      position: { top: "50%", right: "10%", transform: "translate(0%, -50%)" },
    },
    {
      label: "Ceiling",
      section: "ceiling",
      color: "pink",
      size: "sm" as const,
      position: { bottom: "15%", left: "50%", transform: "translate(-50%, 0%)" },
    },
  ]

  /**
   * cafePlanets: Planet orb navigation for Cafe section (NOT CURRENTLY USED)
   * Alternative planet-based navigation (replaced with glass frame menu)
   * Four orbs with different colors and positions
   */
  const cafePlanets = [
    {
      label: "Meni",
      section: "meni",
      color: "blue",
      size: "md" as const,
      position: { top: "15%", left: "20%", transform: "translate(-50%, -50%)" },
    },
    {
      label: "Zakup prostora",
      section: "zakup",
      color: "pink",
      size: "lg" as const,
      position: { top: "45%", right: "15%", transform: "translate(0%, -50%)" },
    },
    {
      label: "Radno vreme",
      section: "radno",
      color: "yellow",
      size: "md" as const,
      position: { bottom: "20%", left: "25%", transform: "translate(-50%, 0%)" },
    },
    {
      label: "Kontakt",
      section: "kontakt",
      color: "green",
      size: "sm" as const,
      position: { top: "30%", left: "50%", transform: "translate(-50%, -50%)" },
    },
  ]

  /**
   * stars: Background starfield animation
   * useMemo: Cached array to prevent regenerating on every render
   * - 100 stars with random positions (0-100% left/top)
   * - Random sizes (0.5-2.5px)
   * - Random opacity (0.7-1.0)
   * - Staggered animations (0-3s delay, 2-5s duration)
   * Each star pulses opacity and scale in infinite loop
   */
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + .5,
      opacity: Math.random() * 0.3 + 0.7,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
    }))
  }, [])

  /**
   * sensoryGalleryImages: Placeholder gallery images for Sensory section
   * Array of 6 images displayed in 2x3 or 3x3 grid
   * Each has query string used for placeholder.svg generation
   */
  const sensoryGalleryImages = [
    { id: 1, query: "sensory room with bubble tubes and fiber optic lights" },
    { id: 2, query: "interactive sensory wall with colorful lights" },
    { id: 3, query: "children playing in sensory room with projection" },
    { id: 4, query: "glowing fiber optic sensory equipment" },
    { id: 5, query: "sensory room bubble tube column" },
    { id: 6, query: "interactive floor projection in sensory room" },
  ]

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

  /**
   * igraonicaGalleryImages: Placeholder gallery images for Igraonica section
   * Array of 6 images showing interactive playground technology
   * Displayed in scrollable gallery after TypewriterText description
   */
  const igraonicaGalleryImages = [
    { id: 1, query: "children playing with interactive floor projection" },
    { id: 2, query: "kids enjoying interactive wall games" },
    { id: 3, query: "colorful playground with projection technology" },
    { id: 4, query: "children playing interactive motion games" },
    { id: 5, query: "modern indoor playground with digital games" },
    { id: 6, query: "kids having fun in interactive play area" },
  ]

  // ========== JSX RENDER ==========

  return (
    // Main container: Full screen with black background
    // min-h-screen: Minimum height 100vh
    // overflow-hidden: Prevents scrollbars from showing
    <div className="min-h-screen w-full bg-black overflow-hidden">
      {/* ========== STARFIELD BACKGROUND ========== */}
      {/* Fixed layer behind all content with 100 animated stars */}
      {/* pointer-events-none: Stars don't block clicks */}
      {/* z-0: Lowest z-index layer */}
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
                rotate: Math.random() * 360
              }}
              animate={{
                opacity: [0, star.opacity, star.opacity * 0.7, star.opacity],
                scale: [0, 1.5, 1, 1.2, 1],
                rotate: [Math.random() * 360, Math.random() * 360 + 360],
              }}
              exit={{
                opacity: 0,
                scale: 0,
                transition: { duration: 0.5 }
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

      {/* ========== BACK BUTTON ========== */}
      {/* Only shows when inside a section (activeView is not null) */}
      {/* AnimatePresence: Handles exit animations */}
      {/* fixed: Stays in top-left corner when scrolling */}
      {/* z-50: Highest z-index to stay above all content */}
      <AnimatePresence>
        {activeView && (
          <motion.button
            onClick={goBackToMenu}
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
                className="cursor-pointer focus:outline-none group"
                whileHover={!isAnimating ? { scale: 1.05 } : {}}
                whileTap={!isAnimating ? { scale: 0.95 } : {}}
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
                {/* X Logo Image */}
                {/* Sizes: 96px→128px→160px→192px (mobile→desktop) */}
                {/* group-hover:brightness-125: Brightens on hover */}
                <div className="rounded-3xl overflow-hidden">
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
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white tracking-tight"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      plorium
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
                {/* ========== CAFE SECTION ========== */}
                {/* Glass frame menu with neon-glowing submenu items */}
                {/* Submenus: Meni, Zakup prostora, Radno vreme, Kontakt */}
                {activeView === "cafe" && (
                  <>
                    {!cafeSubView ? (
                      <motion.div
                        className="relative w-full max-w-2xl mx-auto aspect-[3/4] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        {/* Glass frame with border glow */}
                        <motion.div
                          className="relative w-full h-full border-2 border-cyan-400/40 rounded-lg bg-black/10"
                          style={{
                            boxShadow: "0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.1)",
                          }}
                          initial={{ opacity: 5, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {/* Corner screws */}
                          {[
                            { top: "1rem", left: "1rem" },
                            { top: "1rem", right: "1rem" },
                            { bottom: "1rem", left: "1rem" },
                            { bottom: "1rem", right: "1rem" },
                          ].map((position, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-700"
                              style={{
                                ...position,
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                            >
                              {/* Screw slot */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-0.5 bg-gray-900 rounded-full" />
                              </div>
                            </motion.div>
                          ))}

                          {/* Menu items */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 px-8">
                            {[
                              {
                                label: "Meni",
                                section: "meni",
                                color: "cyan",
                                shadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #22d3ee",
                              },
                              {
                                label: "Pricing",
                                section: "pricing",
                                color: "emerald",
                                shadow: "0 0 20px #10b981, 0 0 40px #10b981, 0 0 60px #10b981",
                              },
                              {
                                label: "Zakup prostora",
                                section: "zakup",
                                color: "pink",
                                shadow: "0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 60px #ec4899",
                              },
                              {
                                label: "Dogadjaji",
                                section: "dogadjaji",
                                color: "purple",
                                shadow: "0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 60px #a855f7",
                              },
                              {
                                label: "Radno vreme",
                                section: "radno",
                                color: "yellow",
                                shadow: "0 0 20px #fbbf24, 0 0 40px #fbbf24, 0 0 60px #fbbf24",
                              },
                              {
                                label: "Kontakt",
                                section: "kontakt",
                                color: "cyan",
                                shadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #22d3ee",
                              },
                            ].map((item, index) => (
                              <motion.button
                                key={item.section}
                                onClick={() => setCafeSubView(item.section)}
                                className={`text-${item.color}-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Great_Vibes'] cursor-pointer transition-all duration-300 hover:scale-110`}
                                style={{
                                  textShadow: item.shadow,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{
                                  textShadow: item.shadow
                                    .replace(/20px/g, "30px")
                                    .replace(/40px/g, "50px")
                                    .replace(/60px/g, "70px"),
                                }}
                              >
                                {item.label}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="relative w-full max-w-2xl mx-auto aspect-[3/4] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        {/* Glass frame container for content */}
                        <motion.div
                          className="relative w-full h-full border-2 border-cyan-400/40 rounded-lg bg-black/10 overflow-hidden"
                          style={{
                            boxShadow: "0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.1)",
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {/* Corner screws */}
                          {[
                            { top: "1rem", left: "1rem" },
                            { top: "1rem", right: "1rem" },
                            { bottom: "1rem", left: "1rem" },
                            { bottom: "1rem", right: "1rem" },
                          ].map((position, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-700 z-10"
                              style={{
                                ...position,
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                            >
                              {/* Screw slot */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-0.5 bg-gray-900 rounded-full" />
                              </div>
                            </motion.div>
                          ))}

                          {/* Scrollable content inside glass frame */}
                          <div className={`h-full p-8 sm:p-12 ${cafeSubView === "kontakt" || cafeSubView === "zakup" || cafeSubView === "meni" || cafeSubView === "dogadjaji" || cafeSubView === "pricing" ? "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-cyan-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5" : "flex items-center justify-center"}`}>
                            <div className="text-center w-full">
                              <motion.h2
                                className="text-4xl sm:text-5xl md:text-6xl text-cyan-400 mb-6 tracking-tight font-['Great_Vibes'] capitalize"
                                style={{
                                  textShadow: "0 0 20px #22d3ee, 0 0 40px #22d3ee",
                                }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                              >
                                {cafeSubView === "meni"
                                  ? "Meni"
                                  : cafeSubView === "pricing"
                                    ? "Pricing"
                                    : cafeSubView === "zakup"
                                      ? "Zakup prostora"
                                      : cafeSubView === "dogadjaji"
                                        ? "Dogadjaji"
                                        : cafeSubView === "radno"
                                          ? "Radno vreme"
                                          : "Kontakt"}
                              </motion.h2>

                              {cafeSubView === "meni" && (
                                <motion.div
                                  className="max-w-lg mx-auto"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                  {/* Pricing Section */}
                                  <div className="mb-8">
                                    <h3 className="text-cyan-400 font-['Great_Vibes'] text-3xl mb-6">
                                      Cenovnik
                                    </h3>
                                    <div className="space-y-3">
                                      {[
                                        { item: "Kafa (espresso, kapućino)", price: "200 RSD" },
                                        { item: "Čaj (razne vrste)", price: "150 RSD" },
                                        { item: "Sokovi (prirodni)", price: "250 RSD" },
                                        { item: "Palačinke", price: "300 RSD" },
                                        { item: "Sendviči", price: "350 RSD" },
                                        { item: "Torte i kolači", price: "280 RSD" },
                                        { item: "Voćna salata", price: "320 RSD" },
                                        { item: "Dečije meni", price: "450 RSD" },
                                      ].map((item, index) => (
                                        <motion.div
                                          key={index}
                                          className="flex justify-between items-center py-2 px-4 bg-white/5 border border-cyan-400/20 rounded-lg"
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                                          whileHover={{
                                            borderColor: "rgba(34, 211, 238, 0.5)",
                                            backgroundColor: "rgba(255, 255, 255, 0.08)"
                                          }}
                                        >
                                          <span className="text-white/90 text-sm text-left">
                                            {item.item}
                                          </span>
                                          <span className="text-cyan-400 font-medium text-sm whitespace-nowrap ml-4">
                                            {item.price}
                                          </span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {cafeSubView === "pricing" && (
                                <motion.div
                                  className="max-w-4xl mx-auto"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                  <p className="text-white/70 text-sm mb-8">
                                    Izaberite paket koji najbolje odgovara Vašim potrebama
                                  </p>

                                  {/* Playground Pricing */}
                                  <div className="mb-10">
                                    <h3 className="text-pink-400 font-['Great_Vibes'] text-3xl mb-6">
                                      Igraonica Paketi
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {[
                                        {
                                          name: "1 Sat Igre",
                                          price: "500 RSD",
                                          popular: false,
                                          features: ["1 sat igranja", "Pristup svim aktivnostima", "Roditeljski nadzor"],
                                        },
                                        {
                                          name: "3 Sata Igre",
                                          price: "1200 RSD",
                                          popular: true,
                                          features: ["3 sata igranja", "Sve aktivnosti", "Besplatan napitak", "10% popust"],
                                        },
                                        {
                                          name: "Rođendanski Paket",
                                          price: "8000 RSD",
                                          popular: false,
                                          features: ["4 sata ekskluzivno", "Dekoracija prostora", "Torta i piće", "Animator", "Do 15 dece"],
                                        },
                                      ].map((pkg, index) => (
                                        <motion.div
                                          key={index}
                                          className={`relative bg-white/5 border ${pkg.popular ? "border-pink-400/50" : "border-pink-400/20"} rounded-lg p-4`}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                          whileHover={{
                                            borderColor: pkg.popular ? "rgba(236, 72, 153, 0.8)" : "rgba(236, 72, 153, 0.5)",
                                            scale: 1.02,
                                          }}
                                          style={pkg.popular ? { boxShadow: "0 0 20px rgba(236, 72, 153, 0.2)" } : {}}
                                        >
                                          {pkg.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium"
                                              style={{ textShadow: "0 0 10px rgba(236, 72, 153, 0.8)" }}>
                                              Najpopularnije
                                            </div>
                                          )}
                                          <h4 className="text-white font-['Great_Vibes'] text-2xl mb-2">{pkg.name}</h4>
                                          <p className="text-pink-400 text-2xl font-bold mb-4">{pkg.price}</p>
                                          <ul className="space-y-2 mb-4">
                                            {pkg.features.map((feature, i) => (
                                              <li key={i} className="text-white/70 text-xs flex items-start">
                                                <span className="text-pink-400 mr-2">✓</span>
                                                {feature}
                                              </li>
                                            ))}
                                          </ul>
                                          <motion.button
                                            onClick={() => setCafeSubView("zakup")}
                                            className="w-full py-2 bg-pink-400/20 border border-pink-400/40 rounded-lg text-pink-400 text-sm hover:bg-pink-400/30 transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            Rezerviši
                                          </motion.button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Sensory Room Pricing */}
                                  <div className="mb-10">
                                    <h3 className="text-purple-400 font-['Great_Vibes'] text-3xl mb-6">
                                      Sensory Soba Paketi
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {[
                                        {
                                          name: "Sesija 30 min",
                                          price: "600 RSD",
                                          popular: false,
                                          features: ["30 minuta", "Vođena sesija", "Individualni pristup"],
                                        },
                                        {
                                          name: "Sesija 1 sat",
                                          price: "1000 RSD",
                                          popular: true,
                                          features: ["1 sat terapije", "Personalizovana sesija", "Stručni terapeut", "Besplatan čaj"],
                                        },
                                        {
                                          name: "Mesečni Paket",
                                          price: "7000 RSD",
                                          popular: false,
                                          features: ["8 sesija (1 sat)", "Fleksibilno zakazivanje", "Praćenje napretka", "20% ušteda"],
                                        },
                                      ].map((pkg, index) => (
                                        <motion.div
                                          key={index}
                                          className={`relative bg-white/5 border ${pkg.popular ? "border-purple-400/50" : "border-purple-400/20"} rounded-lg p-4`}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                                          whileHover={{
                                            borderColor: pkg.popular ? "rgba(168, 85, 247, 0.8)" : "rgba(168, 85, 247, 0.5)",
                                            scale: 1.02,
                                          }}
                                          style={pkg.popular ? { boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)" } : {}}
                                        >
                                          {pkg.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium"
                                              style={{ textShadow: "0 0 10px rgba(168, 85, 247, 0.8)" }}>
                                              Najpopularnije
                                            </div>
                                          )}
                                          <h4 className="text-white font-['Great_Vibes'] text-2xl mb-2">{pkg.name}</h4>
                                          <p className="text-purple-400 text-2xl font-bold mb-4">{pkg.price}</p>
                                          <ul className="space-y-2 mb-4">
                                            {pkg.features.map((feature, i) => (
                                              <li key={i} className="text-white/70 text-xs flex items-start">
                                                <span className="text-purple-400 mr-2">✓</span>
                                                {feature}
                                              </li>
                                            ))}
                                          </ul>
                                          <motion.button
                                            onClick={() => setCafeSubView("zakup")}
                                            className="w-full py-2 bg-purple-400/20 border border-purple-400/40 rounded-lg text-purple-400 text-sm hover:bg-purple-400/30 transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            Rezerviši
                                          </motion.button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Cafe Pricing */}
                                  <div className="mb-10">
                                    <h3 className="text-cyan-400 font-['Great_Vibes'] text-3xl mb-6">
                                      Cafe Paketi
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {[
                                        {
                                          name: "Individualni Gost",
                                          price: "Od 200 RSD",
                                          popular: false,
                                          features: ["À la carte meni", "Sve pije i hrana", "WiFi pristup", "Udoban prostor"],
                                        },
                                        {
                                          name: "Porodični Paket",
                                          price: "1500 RSD",
                                          popular: true,
                                          features: ["2 odraslih + 2 dece", "Napici i zalogaji", "1 sat igraonica", "15% popust"],
                                        },
                                        {
                                          name: "Grupni Događaj",
                                          price: "Od 5000 RSD",
                                          popular: false,
                                          features: ["Ekskluzivan prostor", "Prilagođen meni", "Catering usluga", "Do 30 osoba"],
                                        },
                                      ].map((pkg, index) => (
                                        <motion.div
                                          key={index}
                                          className={`relative bg-white/5 border ${pkg.popular ? "border-cyan-400/50" : "border-cyan-400/20"} rounded-lg p-4`}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                                          whileHover={{
                                            borderColor: pkg.popular ? "rgba(34, 211, 238, 0.8)" : "rgba(34, 211, 238, 0.5)",
                                            scale: 1.02,
                                          }}
                                          style={pkg.popular ? { boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)" } : {}}
                                        >
                                          {pkg.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs px-3 py-1 rounded-full font-medium"
                                              style={{ textShadow: "0 0 10px rgba(34, 211, 238, 0.8)" }}>
                                              Najpopularnije
                                            </div>
                                          )}
                                          <h4 className="text-white font-['Great_Vibes'] text-2xl mb-2">{pkg.name}</h4>
                                          <p className="text-cyan-400 text-2xl font-bold mb-4">{pkg.price}</p>
                                          <ul className="space-y-2 mb-4">
                                            {pkg.features.map((feature, i) => (
                                              <li key={i} className="text-white/70 text-xs flex items-start">
                                                <span className="text-cyan-400 mr-2">✓</span>
                                                {feature}
                                              </li>
                                            ))}
                                          </ul>
                                          <motion.button
                                            onClick={() => setCafeSubView("zakup")}
                                            className="w-full py-2 bg-cyan-400/20 border border-cyan-400/40 rounded-lg text-cyan-400 text-sm hover:bg-cyan-400/30 transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            Rezerviši
                                          </motion.button>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Group Discount Info */}
                                  <motion.div
                                    className="bg-gradient-to-r from-emerald-400/10 via-cyan-400/10 to-purple-400/10 border border-emerald-400/30 rounded-lg p-6 mt-8"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 1.5 }}
                                  >
                                    <h4 className="text-emerald-400 font-['Great_Vibes'] text-2xl mb-3">
                                      Grupni Popusti
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80 text-xs">
                                      <div className="text-center">
                                        <p className="text-emerald-400 text-xl font-bold mb-1">10%</p>
                                        <p>Grupe 10-20 osoba</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-cyan-400 text-xl font-bold mb-1">15%</p>
                                        <p>Grupe 20-30 osoba</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-purple-400 text-xl font-bold mb-1">20%</p>
                                        <p>Grupe 30+ osoba</p>
                                      </div>
                                    </div>
                                    <p className="text-white/60 text-xs text-center mt-4">
                                      Kontaktirajte nas za prilagođene pakete za škole i organizacije
                                    </p>
                                  </motion.div>
                                </motion.div>
                              )}

                              {cafeSubView === "dogadjaji" && (
                                <motion.div
                                  className="max-w-lg mx-auto"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                  {/* Event Calendar */}
                                  <div className="mb-4">
                                    <p className="text-white/70 text-sm mb-8">
                                      Nadolazeci dogadjaji u Xplorium-u
                                    </p>
                                    <div className="space-y-4">
                                      {[
                                        {
                                          title: "Dečija Radionica",
                                          date: "15. Novembar",
                                          time: "10:00 - 12:00",
                                          description: "Kreativna radionica za decu 5-10 godina"
                                        },
                                        {
                                          title: "Porodični Dan",
                                          date: "18. Novembar",
                                          time: "14:00 - 18:00",
                                          description: "Specijalne aktivnosti i popusti za porodice"
                                        },
                                        {
                                          title: "Muzička Zabava",
                                          date: "22. Novembar",
                                          time: "16:00 - 19:00",
                                          description: "Live muzika i animatori za decu"
                                        },
                                        {
                                          title: "Čarobni Petak",
                                          date: "25. Novembar",
                                          time: "17:00 - 20:00",
                                          description: "Magične predstave i zabavne igre"
                                        },
                                        {
                                          title: "Zimska Čarolija",
                                          date: "29. Novembar",
                                          time: "15:00 - 19:00",
                                          description: "Specijalni zimski program sa ukrašavanjem"
                                        },
                                      ].map((event, index) => (
                                        <motion.div
                                          key={index}
                                          className="bg-white/5 border border-purple-400/20 rounded-lg p-4"
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                          whileHover={{
                                            borderColor: "rgba(168, 85, 247, 0.5)",
                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                            scale: 1.02
                                          }}
                                        >
                                          <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-white font-['Great_Vibes'] text-xl">
                                              {event.title}
                                            </h4>
                                            <span className="text-purple-400 text-xs font-medium">
                                              {event.time}
                                            </span>
                                          </div>
                                          <p className="text-purple-400/80 text-xs mb-2">
                                            {event.date}
                                          </p>
                                          <p className="text-white/70 text-xs leading-relaxed">
                                            {event.description}
                                          </p>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Special Note */}
                                  <motion.div
                                    className="bg-purple-400/10 border border-purple-400/30 rounded-lg p-4 mt-6"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 1.2 }}
                                  >
                                    <p className="text-white/80 text-xs leading-relaxed">
                                      Svi događaji zahtevaju rezervaciju. Kontaktirajte nas za više informacija ili koristite formu za zakup prostora.
                                    </p>
                                  </motion.div>
                                </motion.div>
                              )}

                              {cafeSubView === "radno" && (
                                <motion.div
                                  className="max-w-md mx-auto"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                  <p className="text-white/70 text-sm mb-8">
                                    Otvoreni smo svakog dana
                                  </p>

                                  {/* Days of Week */}
                                  <div className="space-y-3 mb-8">
                                    {[
                                      { day: "Ponedeljak", hours: "07:00 - 22:00" },
                                      { day: "Utorak", hours: "07:00 - 22:00" },
                                      { day: "Sreda", hours: "07:00 - 22:00" },
                                      { day: "Četvrtak", hours: "07:00 - 22:00" },
                                      { day: "Petak", hours: "07:00 - 22:00" },
                                      { day: "Subota", hours: "07:00 - 22:00" },
                                      { day: "Nedelja", hours: "07:00 - 22:00" },
                                    ].map((item, index) => (
                                      <motion.div
                                        key={item.day}
                                        className="flex justify-between items-center py-3 px-4 bg-white/5 border border-cyan-400/20 rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                        whileHover={{
                                          borderColor: "rgba(34, 211, 238, 0.5)",
                                          backgroundColor: "rgba(255, 255, 255, 0.08)"
                                        }}
                                      >
                                        <span className="text-white/90 font-['Great_Vibes'] text-xl">
                                          {item.day}
                                        </span>
                                        <span className="text-cyan-400 font-medium text-sm">
                                          {item.hours}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>

                                  {/* Special Note */}
                                  <motion.div
                                    className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg p-4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 1.2 }}
                                  >
                                    <p className="text-cyan-400 font-['Great_Vibes'] text-2xl mb-2">
                                      Napomena
                                    </p>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                      Za rezervacije prostora kontaktirajte nas unapred.
                                      Praznici mogu imati izmenjeno radno vreme.
                                    </p>
                                  </motion.div>
                                </motion.div>
                              )}

                              {cafeSubView === "zakup" && (
                                <motion.div
                                  className="max-w-lg mx-auto"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                  <p className="text-white/70 text-sm mb-6">
                                    Rezervišite prostor za Vaš poseban događaj
                                  </p>

                                  <form className="space-y-4 text-left">
                                    {/* Name */}
                                    <div>
                                      <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                        Ime i Prezime
                                      </label>
                                      <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                        placeholder="Vaše ime"
                                      />
                                    </div>

                                    {/* Email */}
                                    <div>
                                      <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                        Email
                                      </label>
                                      <input
                                        type="email"
                                        className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                        placeholder="vas@email.com"
                                      />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                      <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                        Telefon
                                      </label>
                                      <input
                                        type="tel"
                                        className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                        placeholder="+381 XX XXX XXXX"
                                      />
                                    </div>

                                    {/* Date and Time Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                          Datum
                                        </label>
                                        <input
                                          type="date"
                                          className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                          Vreme
                                        </label>
                                        <input
                                          type="time"
                                          className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                        />
                                      </div>
                                    </div>

                                    {/* Number of Guests */}
                                    <div>
                                      <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                        Broj dece
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                        placeholder="Npr. 10"
                                      />
                                    </div>

                                    {/* Event Type */}
                                    <div>
                                      <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                        Tip događaja
                                      </label>
                                      <select className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all">
                                        <option value="" className="bg-gray-900">Izaberite...</option>
                                        <option value="birthday" className="bg-gray-900">Rođendan</option>
                                        <option value="private" className="bg-gray-900">Privatni događaj</option>
                                        <option value="school" className="bg-gray-900">Školska poseta</option>
                                        <option value="other" className="bg-gray-900">Ostalo</option>
                                      </select>
                                    </div>

                                    {/* Special Requests */}
                                    <div>
                                      <label className="block text-cyan-400 text-sm font-['Great_Vibes'] text-lg mb-1">
                                        Posebni zahtevi
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 bg-white/5 border border-cyan-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all resize-none"
                                        placeholder="Napomene ili posebni zahtevi..."
                                      />
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                      type="submit"
                                      className="w-full py-3 bg-cyan-400/20 border-2 border-cyan-400/40 rounded-lg text-cyan-400 font-['Great_Vibes'] text-2xl hover:bg-cyan-400/30 hover:border-cyan-400/60 transition-all"
                                      style={{
                                        textShadow: "0 0 10px #22d3ee",
                                      }}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Pošaljite rezervaciju
                                    </motion.button>
                                  </form>
                                </motion.div>
                              )}

                              {cafeSubView === "kontakt" && (
                                <>
                                  <motion.div
                                    className="mx-auto text-white/80"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                  >
                                    <p className="text-sm sm:text-base leading-relaxed mb-4">
                                      Posetite nas u srcu grada! Xplorium se nalazi na idealnoj lokaciji.
                                    </p>

                                    <div className="space-y-3 text-left bg-white/5 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-4">
                                      <div>
                                        <h3 className="text-cyan-400 font-['Great_Vibes'] text-xl mb-1">Adresa</h3>
                                        <p className="text-white/90 text-sm">Unesite vašu adresu ovde</p>
                                      </div>

                                      <div>
                                        <h3 className="text-cyan-400 font-['Great_Vibes'] text-xl mb-1">Telefon</h3>
                                        <p className="text-white/90 text-sm">+381 XX XXX XXXX</p>
                                      </div>

                                      <div>
                                        <h3 className="text-cyan-400 font-['Great_Vibes'] text-xl mb-1">Email</h3>
                                        <p className="text-white/90 text-sm">info@xplorium.com</p>
                                      </div>
                                    </div>
                                  </motion.div>

                                  <motion.div
                                    className="mx-auto mt-4 rounded-lg overflow-hidden border-2 border-cyan-400/40"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    style={{
                                      boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)",
                                    }}
                                  >
                                    <iframe
                                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d375.855485521623!2d21.907374439255186!3d43.323535465737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srs!4v1762308540330!5m2!1sen!2srs"
                                      width="100%"
                                      height="200"
                                      style={{ border: 0 }}
                                      allowFullScreen
                                      loading="lazy"
                                      referrerPolicy="no-referrer-when-downgrade"
                                      className="w-full"
                                    />
                                  </motion.div>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* ========== SENSORY SECTION ========== */}
                {/* Planet orb navigation with Floor/Wall/Ceiling options */}
                {/* Each orb: Different size, color, floating animation */}
                {activeView === "discover" && (
                  <>
                    {!sensorySubView ? (
                      <motion.div
                        className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl aspect-square flex items-center justify-center px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        {sensoryPlanets.map((planet, index) => (
                          <PlanetOrb
                            key={planet.section}
                            label={planet.label}
                            color={planet.color}
                            size={planet.size}
                            position={planet.position}
                            delay={0.3 + index * 0.2}
                            onClick={() => setSensorySubView(planet.section)}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <div className="h-[80vh] overflow-y-auto scroll-smooth snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <motion.div
                          className="snap-start min-h-[80vh] flex items-center justify-center px-4 relative bg-transparent"
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="text-center bg-transparent">
                            <motion.h2
                              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 sm:mb-6 tracking-tight font-['Great_Vibes'] capitalize"
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                            >
                              {sensorySubView}
                            </motion.h2>
                          </div>

                          <motion.div
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          >
                            <motion.p
                              className="text-white/60 text-sm font-['Great_Vibes']"
                              animate={{ opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            >
                              Scroll for Gallery
                            </motion.p>
                            <motion.div
                              animate={{ y: [0, 10, 0] }}
                              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            >
                              <ChevronDown className="w-6 h-6 text-white/60" />
                            </motion.div>
                          </motion.div>
                        </motion.div>

                        <motion.div
                          className="snap-start min-h-[80vh] flex flex-col items-center justify-center px-4 pb-12"
                          initial={{ opacity: 0, y: 100 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.3 }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <motion.div
                            className="max-w-4xl mx-auto w-full"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          >
                            <motion.p
                              className="text-white/60 text-base sm:text-lg mb-6 font-['Great_Vibes'] text-center"
                              animate={{ y: [0, 10, 0] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            >
                              Gallery
                            </motion.p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                              {sensoryGalleryImages.map((image, i) => (
                                <motion.div
                                  key={image.id}
                                  className="aspect-square rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
                                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                  viewport={{ once: false, amount: 0.3 }}
                                  transition={{
                                    duration: 0.6,
                                    delay: i * 0.1,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                  whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.3)" }}
                                >
                                  <img
                                    src={`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(image.query)}`}
                                    alt={`Sensory ${sensorySubView} ${image.id}`}
                                    className="w-full h-full object-cover"
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    )}
                  </>
                )}

                {/* ========== IGRAONICA SECTION ========== */}
                {/* Interactive playground description with TypewriterText effect */}
                {/* Scroll-based layout: Title/Description → Gallery images */}
                {activeView === "igraonica" && (
                  <div className="h-[80vh] overflow-y-auto scroll-smooth snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <motion.div
                      className="snap-start min-h-[80vh] flex items-center justify-center px-4 relative bg-transparent"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.5 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="text-center bg-transparent">
                        <motion.h2
                          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 sm:mb-6 tracking-tight font-['Great_Vibes']"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          Igraonica
                        </motion.h2>
                        <motion.p
                          className="text-xl sm:text-2xl md:text-3xl text-white/90 leading-relaxed max-w-3xl mx-auto font-['Great_Vibes']"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          
                        </motion.p>
                      </div>

                      <motion.div
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 8 }}
                      >
                        <motion.p
                          className="text-white/60 text-sm font-['Great_Vibes']"
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        >
                          Scroll for Gallery
                        </motion.p>
                        <motion.div
                          animate={{ y: [0, 10, 0] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        >
                          <ChevronDown className="w-6 h-6 text-white/60" />
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="snap-start min-h-[80vh] flex flex-col items-center justify-center px-4 pb-12"
                      initial={{ opacity: 0, y: 100 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.div
                        className="max-w-4xl mx-auto w-full"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <motion.p
                          className="text-white/60 text-base sm:text-lg mb-6 font-['Great_Vibes'] text-center"
                          animate={{ y: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        >
                          Gallery
                        </motion.p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                          {igraonicaGalleryImages.map((image, i) => (
                            <motion.div
                              key={image.id}
                              className="aspect-square rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
                              initial={{ opacity: 0, scale: 0.8, y: 30 }}
                              whileInView={{ opacity: 1, scale: 1, y: 0 }}
                              viewport={{ once: false, amount: 0.3 }}
                              transition={{
                                duration: 0.6,
                                delay: i * 0.1,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.3)" }}
                            >
                              <img
                                src={`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(image.query)}`}
                                alt={`Igraonica ${image.id}`}
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                )}
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
    </div>
  )
}
