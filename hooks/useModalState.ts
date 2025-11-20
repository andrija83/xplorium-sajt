import { useState, useCallback } from 'react'

/**
 * useModalState Hook
 *
 * Manages modal state for authentication modals (Sign In, Sign Up, Forgot Password)
 * Following the Mobiscroll pattern for modal management
 *
 * @returns Object containing modal states and handlers
 */
export function useModalState() {
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)

  const handleSignIn = useCallback(() => {
    setIsSignInOpen(true)
  }, [])

  const handleSignUp = useCallback(() => {
    setIsSignUpOpen(true)
  }, [])

  const handleSwitchToSignUp = useCallback(() => {
    setIsSignInOpen(false)
    setIsSignUpOpen(true)
  }, [])

  const handleSwitchToSignIn = useCallback(() => {
    setIsSignUpOpen(false)
    setIsSignInOpen(true)
    setIsForgotPasswordOpen(false)
  }, [])

  const handleSwitchToForgotPassword = useCallback(() => {
    setIsSignInOpen(false)
    setIsForgotPasswordOpen(true)
  }, [])

  const closeSignIn = useCallback(() => setIsSignInOpen(false), [])
  const closeSignUp = useCallback(() => setIsSignUpOpen(false), [])
  const closeForgotPassword = useCallback(() => setIsForgotPasswordOpen(false), [])

  return {
    // State
    isSignInOpen,
    isSignUpOpen,
    isForgotPasswordOpen,

    // Handlers
    handleSignIn,
    handleSignUp,
    handleSwitchToSignUp,
    handleSwitchToSignIn,
    handleSwitchToForgotPassword,
    closeSignIn,
    closeSignUp,
    closeForgotPassword,
  }
}
