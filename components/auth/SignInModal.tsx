"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { LogIn, X, Eye, EyeOff } from "lucide-react"
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

/**
 * SignInModal Component
 *
 * Popup modal for user sign in with email and password.
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
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Neon cyan color matching site theme
  const neonCyan = "#22d3ee"
  const neonCyanGlow = "0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Implement actual authentication logic
    console.log("Sign In:", { email, password })

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Reset form
      setEmail("")
      setPassword("")
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 border-2 border-cyan-400/50 backdrop-blur-xl">
        {/* Header with neon glow */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-cyan-400">
            <LogIn
              className="w-6 h-6"
              style={{
                filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))"
              }}
            />
            <span style={{ textShadow: neonCyanGlow }}>
              Sign In
            </span>
          </DialogTitle>
          <DialogDescription className="text-cyan-100/60">
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                         focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                         transition-all duration-300"
              style={{
                boxShadow: "0 0 10px rgba(34, 211, 238, 0.1)"
              }}
            />
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
                onChange={(e) => setPassword(e.target.value)}
                required
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
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
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
              onClose()
              onSwitchToSignUp?.()
            }}
          >
            Create an account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
