"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogIn, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AUTH_COLORS } from "@/constants/animations"
import { validateEmail, sanitizeInput } from "@/lib/validation"
import { verifyCredentials } from "@/app/actions/auth"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { logger } from "@/lib/logger"

/**
 * SignInModal Component
 *
 * Custom animated modal that drops down from top-right.
 * Features Xplorium's neon cyan styling and glass morphism effects.
 *
 * Pattern follows: https://github.com/acidb/mobiscroll-demos-react
 * - isOpen state controls visibility
 * - onClose handler for dismissal
 * - Form submission handler
 */

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignUp?: () => void
  onForgotPassword?: () => void
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp, onForgotPassword }: SignInModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const { update } = useSession()
  const modalRef = useRef<HTMLDivElement>(null)
  const { neonCyanGlow, inputShadow, glowBackground } = AUTH_COLORS

  // Form reset handler
  const handleClose = () => {
    setEmail("")
    setPassword("")
    setErrors({})
    setShowPassword(false)
    onClose()
  }

  // Keyboard focus trapping
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    if (!password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // First verify credentials server-side (with rate limiting)
      const verifyResult = await verifyCredentials(email, password)

      if (!verifyResult.success) {
        toast.error(verifyResult.error || 'Failed to sign in')
        setIsLoading(false)
        return
      }

      // Credentials valid - now use NextAuth client-side signIn
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.error('Failed to sign in. Please try again.')
        setIsLoading(false)
        return
      }

      toast.success('Signed in successfully!')

      // Update the session to reflect the new authenticated state
      await update()

      handleClose()

      // Refresh the page to update all components
      // Wait for exit animation (500ms)
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      logger.error('Sign in error', error instanceof Error ? error : new Error(String(error)))
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Modal positioned top-right below auth buttons */}
          <motion.div
            ref={modalRef}
            className="fixed top-24 right-6 sm:right-8 z-[70] w-[calc(100%-3rem)] sm:w-[420px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-title"
            aria-describedby="signin-description"
            initial={{
              opacity: 0,
              y: -100,
              x: 50,
              rotate: 10,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
              rotate: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: "120%",
              scale: 0.95,
              transition: { duration: 0.4, ease: "easeIn" }
            }}
            transition={{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy easing for entry
            }}
          >
            {/* Glowing background effect */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: glowBackground,
                filter: "blur(30px)",
              }}
            />

            {/* Rotating gradient border container */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <motion.div
                className="absolute w-[200%] h-[200%] top-1/2 left-1/2"
                style={{
                  background: "conic-gradient(from 0deg, #22d3ee, #a855f7, #ec4899, #fb923c, #facc15, #22c55e, #22d3ee)",
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear"
                }}
              />
            </div>

            {/* Modal content */}
            <div className="relative bg-black/95 backdrop-blur-xl rounded-2xl p-6 m-[3px]">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-cyan-400/60 hover:text-cyan-400 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with neon glow */}
              <div className="mb-6">
                <div className="flex items-center gap-3 text-2xl font-semibold text-cyan-400">
                  <LogIn
                    className="w-6 h-6"
                    aria-hidden="true"
                    style={{
                      filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))"
                    }}
                  />
                  <span id="signin-title" style={{ textShadow: neonCyanGlow }}>
                    Sign In
                  </span>
                </div>
                <p id="signin-description" className="text-cyan-100/60 text-sm mt-2">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyan-300 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(sanitizeInput(e.target.value))
                      if (errors.email) setErrors(prev => ({ ...prev, email: "" }))
                    }}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="min-h-[44px] bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                               focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                               transition-all duration-300"
                    style={{
                      boxShadow: inputShadow
                    }}
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="text-red-400 text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-cyan-300 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors(prev => ({ ...prev, password: "" }))
                      }}
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className="min-h-[44px] bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                                 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                                 transition-all duration-300 pr-10"
                      style={{
                        boxShadow: inputShadow
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60
                                 hover:text-cyan-400 transition-colors disabled:opacity-50"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" role="alert" className="text-red-400 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleClose()
                      onForgotPassword?.()
                    }}
                    className="text-sm text-cyan-400/70 hover:text-cyan-400 transition-colors
                               hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10
                               hover:border-cyan-400/50 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600
                               hover:from-cyan-400 hover:to-cyan-500
                               text-white font-semibold transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: isLoading ? "none" : neonCyanGlow
                    }}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-2 text-cyan-100/50">
                    Don't have an account?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors
                             font-medium hover:underline"
                  onClick={() => {
                    handleClose()
                    onSwitchToSignUp?.()
                  }}
                >
                  Create an account
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
