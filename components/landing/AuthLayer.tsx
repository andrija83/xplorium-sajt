'use client'

import { memo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthButtons } from '@/components/common/AuthButtons'
import { SectionSkeleton } from '@/components/loading/SectionSkeleton'

// Dynamic imports for modals
const SignInModal = dynamic(() => import("@/components/auth/SignInModal").then(m => ({ default: m.SignInModal })), {
  loading: () => <SectionSkeleton />,
  ssr: false
})
const SignUpModal = dynamic(() => import("@/components/auth/SignUpModal").then(m => ({ default: m.SignUpModal })), {
  loading: () => <SectionSkeleton />,
  ssr: false
})
const ForgotPasswordModal = dynamic(() => import("@/components/auth/ForgotPasswordModal").then(m => ({ default: m.ForgotPasswordModal })), {
  loading: () => <SectionSkeleton />,
  ssr: false
})

interface AuthLayerProps {
  showBrand: boolean
  isSignInOpen: boolean
  isSignUpOpen: boolean
  isForgotPasswordOpen: boolean
  onSignIn: () => void
  onSignUp: () => void
  onProfileClick: () => void
  onSwitchToSignUp: () => void
  onSwitchToSignIn: () => void
  onSwitchToForgotPassword: () => void
  onCloseSignIn: () => void
  onCloseSignUp: () => void
  onCloseForgotPassword: () => void
}

/**
 * AuthLayer Component
 *
 * Manages authentication UI elements:
 * - Auth buttons (Sign In/Sign Up) in top-right corner
 * - Authentication modals (Sign In, Sign Up, Forgot Password)
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const AuthLayer = memo(function AuthLayer({
  showBrand,
  isSignInOpen,
  isSignUpOpen,
  isForgotPasswordOpen,
  onSignIn,
  onSignUp,
  onProfileClick,
  onSwitchToSignUp,
  onSwitchToSignIn,
  onSwitchToForgotPassword,
  onCloseSignIn,
  onCloseSignUp,
  onCloseForgotPassword,
}: AuthLayerProps) {
  return (
    <>
      {/* Auth Buttons - Top Right Corner */}
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
              delay: 1.2,
              ease: [0.34, 1.56, 0.64, 1],
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
              onSignIn={onSignIn}
              onSignUp={onSignUp}
              onProfileClick={onProfileClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Modals */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={onCloseSignIn}
        onSwitchToSignUp={onSwitchToSignUp}
        onForgotPassword={onSwitchToForgotPassword}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={onCloseSignUp}
        onSwitchToSignIn={onSwitchToSignIn}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={onCloseForgotPassword}
        onBackToSignIn={onSwitchToSignIn}
      />
    </>
  )
})

AuthLayer.displayName = 'AuthLayer'
