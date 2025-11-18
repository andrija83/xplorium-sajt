/**
 * Animation Constants for Xplorium
 *
 * Centralized configuration for all animation timings, durations, and values
 * to maintain consistency and make adjustments easier.
 */

export const ANIMATION_TIMING = {
  // Starburst Explosion
  STARBURST_DURATION: 0.8,
  STARBURST_LIGHT_RAY_DELAY: 0.01,
  STARBURST_STAR_DELAY: 0.008,
  STARBURST_LIGHT_RAY_COUNT: 16,
  STARBURST_STAR_COUNT: 50,
  STARBURST_STAR_COUNT_MOBILE: 25,
  STARBURST_BASE_DISTANCE: 150,
  STARBURST_MAX_DISTANCE: 650,
  STARBURST_LIGHT_RAY_MIN_WIDTH: 150,
  STARBURST_LIGHT_RAY_MAX_WIDTH: 200,

  // Liquid Morph Text
  LIQUID_MORPH_DURATION: 0.8,
  LIQUID_MORPH_LETTER_DELAY: 0.1,
  LIQUID_MORPH_BASE_DELAY: 0.4,
  LIQUID_MORPH_DRIP_COUNT: 5,
  LIQUID_MORPH_DRIP_DURATION: 0.8,
  LIQUID_MORPH_DRIP_DELAY: 0.05,

  // Planet Orbs
  PLANET_FLOAT_DURATION_MIN: 3,
  PLANET_FLOAT_DURATION_MAX: 5,
  PLANET_FLOAT_DISTANCE: 10,
  PLANET_ENTRANCE_DURATION: 0.6,
  PLANET_ENTRANCE_STAGGER: 0.2,

  // X Logo
  XLOGO_ROTATION_DURATION: 0.8,
  XLOGO_ROTATION_ANGLE: 180,
  XLOGO_SCALE_ACTIVE: 0.4,

  // Pulsing Energy Rings (Brand)
  ENERGY_RING_DURATION: 2.5,
  ENERGY_RING_COUNT: 2,
  ENERGY_RING_STAGGER: 0.5,

  // Particle Ring (Brand)
  PARTICLE_RING_COUNT: 6,
  PARTICLE_RING_DURATION: 5,
  PARTICLE_RING_RADIUS: 50,
  PARTICLE_RING_DELAY: 0.15,
} as const;

export const ANIMATION_EASING = {
  SMOOTH: [0.22, 1, 0.36, 1] as const,
  BOUNCY: [0.34, 1.56, 0.64, 1] as const,
  EASE_OUT: "easeOut" as const,
  EASE_IN_OUT: "easeInOut" as const,
  LINEAR: "linear" as const,
} as const;

export const PARTICLE_COLORS = {
  STARBURST: ["bg-cyan-400", "bg-purple-400", "bg-pink-400", "bg-yellow-400"] as const,
  STARBURST_GRADIENTS: [
    "from-cyan-400 to-cyan-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
  ] as const,
  LIQUID_DRIP: ["bg-cyan-400/60", "bg-purple-400/60", "bg-pink-400/60"] as const,
} as const;

export const NEON_COLORS = {
  CAFE: {
    main: "#22d3ee",
    glow: "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee, 0 0 40px #06b6d4",
  },
  SENSORY: {
    main: "#a855f7",
    glow: "0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7, 0 0 40px #7c3aed",
  },
  IGRAONICA: {
    main: "#ec4899",
    glow: "0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899, 0 0 40px #db2777",
  },
} as const;

export const STYLE_CONSTANTS = {
  CENTER_POSITION: { left: "50%", top: "50%" } as const,
  PARTICLE_BASE_SHADOW: "0 0 15px currentColor, 0 0 25px currentColor",
} as const;

export const AUTH_COLORS = {
  neonCyan: "#22d3ee",
  neonCyanGlow: "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee",
  neonCyanGlowHover: "0 0 15px #22d3ee, 0 0 30px #22d3ee, 0 0 45px #22d3ee, 0 0 60px #06b6d4",
  inputShadow: "0 0 10px rgba(34, 211, 238, 0.1)",
  glowBackground: "radial-gradient(circle at top right, rgba(34, 211, 238, 0.2) 0%, transparent 70%)",
} as const;

// Helper to get particle count based on device
export const getParticleCount = (isMobile: boolean): number => {
  return isMobile
    ? ANIMATION_TIMING.STARBURST_STAR_COUNT_MOBILE
    : ANIMATION_TIMING.STARBURST_STAR_COUNT;
};
