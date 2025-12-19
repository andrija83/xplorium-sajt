"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic"
import { Starfield } from "@/components/common/Starfield"
import { HeroShell, NavigationLayer, SectionManager, AuthLayer } from "@/components/landing"
import { useNavigationState, useLandingAnimation, useModalState } from "@/hooks"

// Dynamically import CosmicDust with SSR disabled to prevent hydration mismatch
const CosmicDust = dynamic(() => import("@/components/effects").then(mod => mod.CosmicDust), {
  ssr: false
})

/**
 * XPLORIUM LANDING PAGE
 *
 * Refactored into modular components for better maintainability:
 * - HeroShell: X logo animation and initial state
 * - NavigationLayer: Brand reveal and main navigation menu
 * - SectionManager: Feature section routing (Cafe, Sensory, Igraonica, Profile)
 * - AuthLayer: Authentication buttons and modals
 *
 * Uses custom hooks for state management:
 * - useLandingAnimation: X logo animation and particle effects
 * - useNavigationState: Section navigation and routing
 * - useModalState: Authentication modal management
 */
export default function Landing() {
  // Custom hooks for state management
  const animation = useLandingAnimation()
  const navigation = useNavigationState()
  const modals = useModalState()

  /**
   * Keyboard navigation support
   * - Escape key: Go back to previous view
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navigation.activeView) {
        e.preventDefault()
        navigation.goBackToMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigation.activeView, navigation.goBackToMenu])

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden">
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
      >
        Skip to main content
      </a>

      {/* Starfield Background */}
      <Starfield activeView={navigation.activeView} />

      {/* Cosmic Dust Particles - Floating atmospheric particles */}
      <CosmicDust density="medium" />

      {/* Auth Layer - Buttons and Modals */}
      <AuthLayer
        showBrand={animation.showBrand}
        isSignInOpen={modals.isSignInOpen}
        isSignUpOpen={modals.isSignUpOpen}
        isForgotPasswordOpen={modals.isForgotPasswordOpen}
        onSignIn={modals.handleSignIn}
        onSignUp={modals.handleSignUp}
        onProfileClick={navigation.handleProfileClick}
        onSwitchToSignUp={modals.handleSwitchToSignUp}
        onSwitchToSignIn={modals.handleSwitchToSignIn}
        onSwitchToForgotPassword={modals.handleSwitchToForgotPassword}
        onCloseSignIn={modals.closeSignIn}
        onCloseSignUp={modals.closeSignUp}
        onCloseForgotPassword={modals.closeForgotPassword}
      />

      {/* Back Button */}
      <AnimatePresence>
        {navigation.activeView && (
          <motion.button
            onClick={navigation.goBackToMenu}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigation.goBackToMenu()
              }
            }}
            aria-label={`Go back to ${navigation.sensorySubView || navigation.cafeSubView ? 'section menu' : 'main menu'}`}
            tabIndex={0}
            className="fixed top-6 left-6 sm:top-8 sm:left-8 z-50 p-3 sm:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white transition-all duration-300 flex items-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            <span className="text-sm font-light hidden sm:inline">Back</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <div id="main-content" className="relative z-10 flex flex-col items-center justify-center px-4 w-full min-h-[600px] sm:min-h-[700px] md:min-h-[800px]" role="main" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
          <AnimatePresence mode="wait">
            {/* Hero Shell - X Logo Animation */}
            {!animation.showBrand && (
              <HeroShell
                key="hero-shell"
                isAnimating={animation.isAnimating}
                showBrand={animation.showBrand}
                prefersReducedMotion={animation.prefersReducedMotion}
                starburstParticles={animation.starburstParticles}
                liquidDripConfig={animation.liquidDripConfig}
                onXClick={animation.handleXClick}
              />
            )}

            {/* Navigation Layer - Brand + Menu */}
            {animation.showBrand && !navigation.activeView && (
              <NavigationLayer
                key="navigation-layer"
                showBrand={animation.showBrand}
                onNavigate={navigation.navigateToSection}
                liquidDripConfig={animation.liquidDripConfig}
              />
            )}

            {/* Section Manager - Feature Sections */}
            {navigation.activeView && <SectionManager key={`section-${navigation.activeView}`} />}
          </AnimatePresence>

          {/* Helper Text */}
          {!animation.isAnimating && !animation.showBrand && (
            <motion.p
              className="absolute top-[calc(50%+8rem)] sm:top-[calc(50%+10rem)] md:top-[calc(50%+12rem)] lg:top-[calc(50%+14rem)] text-white/50 text-xs sm:text-sm font-light tracking-wider text-center px-4 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Enter the Experience
            </motion.p>
          )}

          {animation.showBrand && !navigation.activeView && (
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
