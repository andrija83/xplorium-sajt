"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, X, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AUTH_COLORS } from "@/constants/animations"
import { validateEmail, sanitizeInput } from "@/lib/validation"
import { resetPassword } from "@/app/actions/auth"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

interface ForgotPasswordModalProps {
    isOpen: boolean
    onClose: () => void
    onBackToSignIn: () => void
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToSignIn }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    const modalRef = useRef<HTMLDivElement>(null)
    const { neonCyanGlow, inputShadow, glowBackground } = AUTH_COLORS

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setEmail("")
            setIsSuccess(false)
            setError("")
        }
    }, [isOpen])

    // Keyboard focus trapping
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const emailError = validateEmail(email)
        if (emailError) {
            setError(emailError)
            return
        }

        setIsLoading(true)

        try {
            const result = await resetPassword(email)

            if (result.success) {
                setIsSuccess(true)
                toast.success('Reset link sent!')
            } else {
                setError(result.error || 'Failed to send reset link')
                toast.error(result.error || 'Failed to send reset link')
            }
        } catch (error) {
            logger.error('Reset password error', error instanceof Error ? error : new Error(String(error)))
            setError('An unexpected error occurred')
            toast.error('An unexpected error occurred')
        } finally {
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
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        ref={modalRef}
                        className="fixed top-24 right-6 sm:right-8 z-[70] w-[calc(100%-3rem)] sm:w-[420px]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="forgot-password-title"
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
                            ease: [0.34, 1.56, 0.64, 1],
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
                                onClick={onClose}
                                className="absolute top-4 right-4 text-cyan-400/60 hover:text-cyan-400 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 text-2xl font-semibold text-cyan-400">
                                    <Mail
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                        style={{
                                            filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))"
                                        }}
                                    />
                                    <span id="forgot-password-title" style={{ textShadow: neonCyanGlow }}>
                                        Reset Password
                                    </span>
                                </div>
                                <p className="text-cyan-100/60 text-sm mt-2">
                                    Enter your email to receive a reset link
                                </p>
                            </div>

                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
                                    <p className="text-cyan-100/60 mb-6">
                                        We've sent a password reset link to<br />
                                        <span className="text-cyan-400">{email}</span>
                                    </p>
                                    <Button
                                        onClick={onBackToSignIn}
                                        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white"
                                    >
                                        Back to Sign In
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="reset-email" className="text-cyan-300 text-sm font-medium">
                                            Email
                                        </Label>
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(sanitizeInput(e.target.value))
                                                setError("")
                                            }}
                                            disabled={isLoading}
                                            required
                                            className="min-h-[44px] bg-black/40 border-cyan-400/30 text-white placeholder:text-cyan-100/30
                                 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                                 transition-all duration-300"
                                            style={{
                                                boxShadow: inputShadow
                                            }}
                                        />
                                        {error && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {error}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onBackToSignIn}
                                            disabled={isLoading}
                                            className="flex-1 border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10
                                 hover:border-cyan-400/50 transition-all"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600
                                 hover:from-cyan-400 hover:to-cyan-500
                                 text-white font-semibold transition-all duration-300"
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
                                                "Send Link"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
