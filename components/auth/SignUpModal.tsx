"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AUTH_COLORS } from "@/constants/animations"
import { validateEmail, validatePassword, validateFullName, sanitizeInput } from "@/lib/validation"
import { signUp } from "@/app/actions/auth"
import { toast } from "sonner"

/**
 * SignUpModal Component
 *
 * Custom animated modal that drops down from top-right.
 * Features Xplorium's neon cyan styling and glass morphism effects.
 *
 * Pattern follows: https://github.com/acidb/mobiscroll-demos-react
 * - isOpen state controls visibility
 * - onClose handler for dismissal
 * - Form submission handler with validation
 */

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignIn?: () => void
}

export function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const modalRef = useRef<HTMLDivElement>(null)
  const { neonCyanGlow, inputShadow, glowBackground } = AUTH_COLORS

  const handleChange = (field: string, value: string) => {
    const sanitized = sanitizeInput(value)
    setFormData(prev => ({ ...prev, [field]: sanitized }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Form reset handler
  const handleClose = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    })
    setAcceptTerms(false)
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
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

    const nameError = validateFullName(formData.fullName)
    if (nameError) newErrors.fullName = nameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        toast.success('Account created successfully! Please sign in.')
        handleClose()
        // Optionally switch to sign in modal
        onSwitchToSignIn?.()
      } else {
        toast.error(result.error || 'Failed to create account')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Sign up error:', error)
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
            className="fixed top-24 right-6 sm:right-8 z-[70] w-[calc(100%-3rem)] sm:w-[420px] max-h-[calc(100vh-8rem)] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-title"
            aria-describedby="signup-description"
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
              y: -100,
              x: 50,
              rotate: 10,
              scale: 0.8,
            }}
            transition={{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
            }}
          >
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
                className="absolute top-4 right-4 text-cyan-400/60 hover:text-cyan-400 transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with neon glow */}
              <div className="mb-6">
                <div className="flex items-center gap-3 text-2xl font-semibold text-cyan-400">
                  <UserPlus
                    className="w-6 h-6"
                    aria-hidden="true"
                    style={{
                      filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))"
                    }}
                  />
                  <span id="signup-title" style={{ textShadow: neonCyanGlow }}>
                    Create Account
                  </span>
                </div>
                <p id="signup-description" className="text-cyan-100/60 text-sm mt-2">
                  Join Xplorium and start your journey
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-cyan-300 text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    className="min-h-[44px] bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                               focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                               transition-all duration-300"
                    style={{
                      boxShadow: inputShadow
                    }}
                  />
                  {errors.fullName && (
                    <p id="fullName-error" role="alert" className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-cyan-300 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
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
                    <p id="email-error" role="alert" className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-cyan-300 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
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
                    <p id="password-error" role="alert" className="text-red-400 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-cyan-300 text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      className="min-h-[44px] bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                                 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                                 transition-all duration-300 pr-10"
                      style={{
                        boxShadow: inputShadow
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60
                                 hover:text-cyan-400 transition-colors disabled:opacity-50"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" role="alert" className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    disabled={isLoading}
                    onCheckedChange={(checked) => {
                      setAcceptTerms(checked === true)
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: "" }))
                      }
                    }}
                    aria-invalid={!!errors.terms}
                    aria-describedby={errors.terms ? "terms-error" : undefined}
                    className="mt-1 border-cyan-400/50 data-[state=checked]:bg-cyan-500
                               data-[state=checked]:border-cyan-500"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-cyan-100/70 leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => window.open('/terms', '_blank')}
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Terms and Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => window.open('/privacy', '_blank')}
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
                {errors.terms && (
                  <p id="terms-error" role="alert" className="text-red-400 text-xs">{errors.terms}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <div className="flex-1 relative rounded-lg overflow-hidden">
                    {/* Rotating gradient border for Cancel */}
                    <motion.div 
                      className="absolute w-[300%] h-[300%] top-1/2 left-1/2"
                      style={{
                        background: "conic-gradient(from 0deg, #22d3ee, #a855f7, #ec4899, #fb923c, #facc15, #22c55e, #22d3ee)",
                        x: "-50%",
                        y: "-50%",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 3, 
                        repeat: Number.POSITIVE_INFINITY, 
                        ease: "linear" 
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="relative w-full bg-black border-0 text-cyan-300 hover:bg-black/80
                                 transition-all m-[2px]"
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="flex-1 relative rounded-lg overflow-hidden">
                    {/* Rotating gradient border */}
                    <motion.div 
                      className="absolute w-[300%] h-[300%] top-1/2 left-1/2"
                      style={{
                        background: "conic-gradient(from 0deg, #22d3ee, #a855f7, #ec4899, #fb923c, #facc15, #22c55e, #22d3ee)",
                        x: "-50%",
                        y: "-50%",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 3, 
                        repeat: Number.POSITIVE_INFINITY, 
                        ease: "linear" 
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full bg-gradient-to-r from-cyan-500 to-cyan-600
                                 hover:from-cyan-400 hover:to-cyan-500
                                 text-white font-semibold transition-all duration-300
                                 disabled:opacity-50 disabled:cursor-not-allowed m-[2px]"
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-2 text-cyan-100/50">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center pb-2">
                <button
                  type="button"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors
                             font-medium hover:underline"
                  onClick={() => {
                    handleClose()
                    onSwitchToSignIn?.()
                  }}
                >
                  Sign in instead
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
