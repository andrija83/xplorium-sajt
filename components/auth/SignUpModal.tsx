"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * SignUpModal Component
 *
 * Popup modal for new user registration.
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

  // Neon cyan color matching site theme
  const neonCyan = "#22d3ee"
  const neonCyanGlow = "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee"

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

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

    // TODO: Implement actual registration logic
    console.log("Sign Up:", formData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
      })
      setAcceptTerms(false)
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 border-2 border-cyan-400/50 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        {/* Header with neon glow */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-cyan-400">
            <UserPlus
              className="w-6 h-6"
              style={{
                filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))"
              }}
            />
            <span style={{ textShadow: neonCyanGlow }}>
              Create Account
            </span>
          </DialogTitle>
          <DialogDescription className="text-cyan-100/60">
            Join Xplorium and start your journey
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
              className="bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                         focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                         transition-all duration-300"
              style={{
                boxShadow: "0 0 10px rgba(34, 211, 238, 0.1)"
              }}
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
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
              className="bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                         focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                         transition-all duration-300"
              style={{
                boxShadow: "0 0 10px rgba(34, 211, 238, 0.1)"
              }}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
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
                className="bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                           transition-all duration-300 pr-10"
                style={{
                  boxShadow: "0 0 10px rgba(34, 211, 238, 0.1)"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60
                           hover:text-cyan-400 transition-colors"
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
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
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
                className="bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                           transition-all duration-300 pr-10"
                style={{
                  boxShadow: "0 0 10px rgba(34, 211, 238, 0.1)"
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/60
                           hover:text-cyan-400 transition-colors"
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
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => {
                setAcceptTerms(checked as boolean)
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: "" }))
                }
              }}
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
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Terms and Conditions
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Privacy Policy
              </button>
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-400 text-xs">{errors.terms}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                "Create Account"
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
              onClose()
              onSwitchToSignIn?.()
            }}
          >
            Sign in instead
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
