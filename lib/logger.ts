/**
 * Centralized logging utility for the application
 *
 * Features:
 * - Different log levels (debug, info, warn, error)
 * - Automatic environment detection (dev vs production)
 * - Structured logging with context
 * - PII sanitization in production
 * - Disabled in production by default (except errors)
 * - Color-coded console output in development
 * - Timestamps for all logs
 *
 * Usage:
 * import { logger } from '@/lib/logger'
 *
 * logger.debug('Database query', { query, params })
 * logger.info('User logged in', { userId })
 * logger.warn('Deprecated API usage', { endpoint })
 * logger.error('Database error', error)
 */

import { sanitizePII } from './sanitize'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment: boolean
  private isTest: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isTest = process.env.NODE_ENV === 'test'
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext | Error): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    let formattedMessage = `${prefix} ${message}`

    if (context) {
      // Sanitize context in production to prevent PII exposure
      const sanitizedContext = !this.isDevelopment ? sanitizePII(context) : context

      if (sanitizedContext instanceof Error) {
        formattedMessage += `\n  Error: ${sanitizedContext.message}`
        if (sanitizedContext.stack && this.isDevelopment) {
          formattedMessage += `\n  Stack: ${sanitizedContext.stack}`
        }
      } else {
        const contextStr = JSON.stringify(sanitizedContext, null, 2)
        formattedMessage += `\n  Context: ${contextStr}`
      }
    }

    return formattedMessage
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case 'error':
        return console.error
      case 'warn':
        return console.warn
      case 'info':
        return console.info
      case 'debug':
      default:
        return console.log
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // Never log in test environment unless explicitly enabled
    if (this.isTest) {
      return false
    }

    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error'
    }

    // In development, log everything
    return true
  }

  /**
   * Log a debug message (development only)
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, context)
      this.getConsoleMethod('debug')(formatted)
    }
  }

  /**
   * Log an info message (development only)
   * Use for general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, context)
      this.getConsoleMethod('info')(formatted)
    }
  }

  /**
   * Log a warning message (all environments)
   * Use for recoverable issues that need attention
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, context)
      this.getConsoleMethod('warn')(formatted)
    }
  }

  /**
   * Log an error message (all environments)
   * Use for errors that need immediate attention
   */
  error(message: string, error?: Error | LogContext): void {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message, error)
      this.getConsoleMethod('error')(formatted)
    }
  }

  /**
   * Log server action errors with consistent formatting
   * Includes action name and error details
   */
  serverActionError(actionName: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error)
    this.error(`Server action failed: ${actionName}`, error instanceof Error ? error : new Error(errorMessage))
  }

  /**
   * Log API route errors with consistent formatting
   */
  apiError(endpoint: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error)
    this.error(`API error at ${endpoint}`, error instanceof Error ? error : new Error(errorMessage))
  }

  /**
   * Log authentication events
   */
  auth(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', `[AUTH] ${message}`, context)
      this.getConsoleMethod('info')(formatted)
    }
  }

  /**
   * Log database operations (development only)
   */
  db(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', `[DB] ${message}`, context)
      this.getConsoleMethod('debug')(formatted)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for use in other files
export type { Logger }
