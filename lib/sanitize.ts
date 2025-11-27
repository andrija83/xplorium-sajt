/**
 * PII Sanitization Utility
 *
 * Removes or masks personally identifiable information from logs and error messages
 * to prevent accidental exposure of sensitive data.
 */

/**
 * List of keys that contain PII and should be sanitized
 */
const PII_KEYS = [
  'password',
  'passwordHash',
  'hashedPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'creditCard',
  'ssn',
  'email', // Partial masking
  'phone', // Partial masking
]

/**
 * Regex patterns for detecting PII in strings
 */
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
}

/**
 * Mask an email address (show first 2 chars and domain)
 * Example: john.doe@example.com -> jo***@example.com
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!domain) return '[REDACTED]'

  const visibleChars = Math.min(2, localPart.length)
  return `${localPart.substring(0, visibleChars)}***@${domain}`
}

/**
 * Mask a phone number (show last 4 digits)
 * Example: 555-123-4567 -> ***-***-4567
 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '[REDACTED]'

  return `***-***-${digits.slice(-4)}`
}

/**
 * Sanitize a value by replacing or masking PII
 */
function sanitizeValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) {
    return value
  }

  // Full redaction for sensitive keys
  if (PII_KEYS.includes(key.toLowerCase())) {
    if (key.toLowerCase() === 'email' && typeof value === 'string') {
      return maskEmail(value)
    }
    if (key.toLowerCase() === 'phone' && typeof value === 'string') {
      return maskPhone(value)
    }
    return '[REDACTED]'
  }

  // String pattern matching
  if (typeof value === 'string') {
    let sanitized = value

    // Mask emails in text
    sanitized = sanitized.replace(PII_PATTERNS.email, (match) => maskEmail(match))

    // Mask phone numbers in text
    sanitized = sanitized.replace(PII_PATTERNS.phone, (match) => maskPhone(match))

    // Redact credit cards
    sanitized = sanitized.replace(PII_PATTERNS.creditCard, '[REDACTED-CC]')

    // Redact SSNs
    sanitized = sanitized.replace(PII_PATTERNS.ssn, '[REDACTED-SSN]')

    return sanitized
  }

  return value
}

/**
 * Recursively sanitize an object or array by removing/masking PII
 */
export function sanitizePII(data: unknown): unknown {
  // Primitives and null
  if (data === null || data === undefined) {
    return data
  }

  // Handle Error objects specially
  if (data instanceof Error) {
    return {
      name: data.name,
      message: sanitizeValue('message', data.message),
      // Stack traces are only included in development
      ...(process.env.NODE_ENV === 'development' && data.stack
        ? { stack: sanitizeValue('stack', data.stack) }
        : {}
      ),
    }
  }

  // Arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizePII(item))
  }

  // Objects
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizePII(value)
      } else {
        sanitized[key] = sanitizeValue(key, value)
      }
    }

    return sanitized
  }

  // Primitives (string, number, boolean)
  return data
}

/**
 * Sanitize error message for client response
 * Returns a safe error message without PII or stack traces
 */
export function sanitizeErrorForClient(error: unknown): string {
  if (error instanceof Error) {
    const sanitizedMessage = sanitizeValue('message', error.message)
    return typeof sanitizedMessage === 'string'
      ? sanitizedMessage
      : 'An unexpected error occurred'
  }

  return 'An unexpected error occurred'
}

/**
 * Create a safe error response for API/server actions
 */
export function createSafeErrorResponse(error: unknown): {
  success: false
  error: string
} {
  return {
    success: false,
    error: sanitizeErrorForClient(error),
  }
}
