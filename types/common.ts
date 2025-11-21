/**
 * Common Types for Xplorium
 *
 * Shared type definitions for components, animations, and utilities
 */

/**
 * Base component props
 */
export interface BaseComponentProps {
  /** CSS class names */
  className?: string
  /** Children elements */
  children?: React.ReactNode
}

/**
 * Animation component base props
 */
export interface AnimationComponentProps extends BaseComponentProps {
  /** Animation delay in seconds */
  delay?: number
  /** Duration in seconds */
  duration?: number
}

/**
 * Text animation props
 */
export interface TextAnimationProps {
  /** Text content to animate */
  text: string
  /** Animation delay in seconds */
  delay?: number
  /** CSS class names */
  className?: string
}

/**
 * Gallery image configuration
 */
export interface GalleryImage {
  /** Unique identifier */
  id: number
  /** Image source path or placeholder query */
  query: string
  /** Optional alt text */
  alt?: string
}

/**
 * Star particle configuration for starfield
 */
export interface StarParticle {
  /** Unique identifier */
  id: number
  /** Horizontal position (percentage) */
  left: number
  /** Vertical position (percentage) */
  top: number
  /** Size in pixels */
  size: number
  /** Opacity value (0-1) */
  opacity: number
  /** Animation delay in seconds */
  delay: number
  /** Animation duration in seconds */
  duration: number
  /** Starting rotation angle in degrees (optional, for section stars) */
  rotateStart?: number
  /** Ending rotation angle in degrees (optional, for section stars) */
  rotateEnd?: number
}

/**
 * Starburst particle configuration
 */
export interface StarburstParticle {
  /** Unique identifier */
  id: number
  /** Angle in degrees (0-360) */
  angle: number
  /** Distance from center in pixels */
  distance: number
  /** Particle size in pixels */
  size: number
  /** Color index for cycling through colors */
  colorIndex: number
}

/**
 * Liquid drip configuration
 */
export interface LiquidDripConfig {
  /** Unique identifier */
  id: number
  /** Horizontal offset from center */
  xOffset: number
  /** Particle width in pixels */
  width: number
  /** Particle height in pixels */
  height: number
  /** Color index for cycling through colors */
  colorIndex: number
}

/**
 * Letter drip configuration (for liquid morph text)
 */
export interface LetterDripConfig {
  /** Letter index in the word */
  letterIndex: number
  /** Array of drip configurations for this letter */
  drips: LiquidDripConfig[]
}

/**
 * Event package configuration
 */
export interface EventPackage {
  /** Package name */
  name: string
  /** Brief description */
  description: string
  /** Price display string */
  price: string
  /** List of included features */
  features: string[]
}

/**
 * Menu package configuration
 */
export interface MenuPackage {
  /** Package name */
  name: string
  /** Price display string */
  price: string
  /** List of included items/features */
  features: string[]
}

/**
 * Color scheme configuration
 */
export interface ColorScheme {
  /** Main color hex value */
  main: string
  /** CSS text-shadow value for glow effect */
  glow: string
}

/**
 * Neon color configuration (for planet orbs)
 */
export interface NeonColorScheme {
  /** Main color hex value */
  main: string
  /** Glow color (rgba format) */
  glow: string
  /** Dark variant (rgba format) */
  dark: string
}

/**
 * Size variants for components
 */
export type SizeVariant = 'sm' | 'md' | 'lg'

/**
 * Color variants for neon effects
 */
export type ColorVariant = 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'pink' | 'cyan'

/**
 * Easing function types
 */
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | number[]

/**
 * Animation direction
 */
export type AnimationDirection = 'left' | 'right' | 'up' | 'down'

/**
 * Loading state
 */
export enum LoadingState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}

/**
 * Generic async operation state
 */
export interface AsyncState<T> {
  /** Loading status */
  status: LoadingState
  /** Data payload (available when status is Success) */
  data: T | null
  /** Error message (available when status is Error) */
  error: string | null
}
