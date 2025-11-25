/**
 * Validation Utilities for Xplorium Authentication
 *
 * Provides secure validation functions for user inputs
 */

/**
 * Validates password strength with comprehensive requirements
 *
 * Requirements:
 * - Minimum 8 characters, maximum 128 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 *
 * @param password - The password to validate
 * @returns Error message string if invalid, null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  if (password.length > 128) return "Password must not exceed 128 characters"
  if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter"
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter"
  if (!/\d/.test(password)) return "Password must include at least one number"
  if (!/[@$!%*?&#^()_+=\-{}[\]:;"'<>,.?/\\|`~]/.test(password)) {
    return "Password must include at least one special character"
  }
  return null
}

/**
 * Validates email address format
 *
 * Uses RFC 5322 compliant regex for comprehensive email validation
 *
 * @param email - The email address to validate
 * @returns Error message string if invalid, null if valid
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required"

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address"
  }

  return null
}

/**
 * Sanitizes user input to prevent XSS attacks
 *
 * - Trims whitespace
 * - Removes potentially dangerous characters
 * - Escapes HTML entities
 *
 * @param input - The string to sanitize
 * @returns Sanitized string safe for storage and display
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
}

/**
 * Validates full name format
 *
 * @param name - The full name to validate
 * @returns Error message string if invalid, null if valid
 */
export const validateFullName = (name: string): string | null => {
  if (!name || !name.trim()) return "Full name is required"
  if (name.trim().length < 2) return "Full name must be at least 2 characters"
  if (name.trim().length > 100) return "Full name must not exceed 100 characters"
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return "Full name can only contain letters, spaces, hyphens, and apostrophes"
  }
  return null
}
