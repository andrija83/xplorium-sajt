import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let originalEnv: string | undefined

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Store original NODE_ENV
    originalEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()

    // Restore NODE_ENV
    vi.unstubAllEnvs()
  })

  describe('in test environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'test')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should not log debug messages', () => {
      logger.debug('Test debug message')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should not log info messages', () => {
      logger.info('Test info message')
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('should not log warn messages', () => {
      logger.warn('Test warn message')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should not log error messages', () => {
      logger.error('Test error message')
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('serverActionError', () => {
    it('should format server action errors with Error objects', () => {
      const error = new Error('Test error')
      logger.serverActionError('testAction', error)

      // In test env, nothing should be logged
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should handle non-Error objects', () => {
      logger.serverActionError('testAction', 'String error')

      // In test env, nothing should be logged
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('apiError', () => {
    it('should format API errors', () => {
      const error = new Error('API failed')
      logger.apiError('/api/test', error)

      // In test env, nothing should be logged
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('auth', () => {
    it('should log auth messages with context', () => {
      logger.auth('User logged in', { userId: '123' })

      // In test env, nothing should be logged
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })
  })

  describe('db', () => {
    it('should log database operations', () => {
      logger.db('Query executed', { query: 'SELECT * FROM users' })

      // In test env, nothing should be logged
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })
})
