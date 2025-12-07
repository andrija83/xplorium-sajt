/**
 * Unit Tests for Validation Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  validatePassword,
  validateEmail,
  sanitizeInput,
  validateFullName,
} from './validation'

describe('validatePassword', () => {
  it('should accept valid passwords', () => {
    expect(validatePassword('Valid123!')).toBeNull()
    expect(validatePassword('MyP@ssw0rd')).toBeNull()
    expect(validatePassword('C0mpl3x!Pass')).toBeNull()
    expect(validatePassword('Test@1234')).toBeNull()
  })

  it('should reject empty password', () => {
    expect(validatePassword('')).toBe('Password is required')
  })

  it('should reject password shorter than 8 characters', () => {
    expect(validatePassword('Short1!')).toBe('Password must be at least 8 characters')
    expect(validatePassword('Test1!')).toBe('Password must be at least 8 characters')
  })

  it('should reject password longer than 128 characters', () => {
    const longPassword = 'A1!' + 'a'.repeat(126)
    expect(validatePassword(longPassword)).toBe('Password must not exceed 128 characters')
  })

  it('should reject password without lowercase letter', () => {
    expect(validatePassword('UPPER123!')).toBe('Password must include at least one lowercase letter')
  })

  it('should reject password without uppercase letter', () => {
    expect(validatePassword('lower123!')).toBe('Password must include at least one uppercase letter')
  })

  it('should reject password without number', () => {
    expect(validatePassword('NoNumber!')).toBe('Password must include at least one number')
  })

  it('should reject password without special character', () => {
    expect(validatePassword('NoSpecial123')).toBe('Password must include at least one special character')
  })

  it('should accept various special characters', () => {
    const specialChars = ['@', '$', '!', '%', '*', '?', '&', '#', '^', '(', ')', '_', '+', '=', '-']
    specialChars.forEach(char => {
      expect(validatePassword(`Valid123${char}`)).toBeNull()
    })
  })
})

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBeNull()
    expect(validateEmail('test.user@domain.co.uk')).toBeNull()
    expect(validateEmail('admin+tag@company.com')).toBeNull()
    expect(validateEmail('user123@test-domain.com')).toBeNull()
  })

  it('should reject empty email', () => {
    expect(validateEmail('')).toBe('Email is required')
  })

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid')).toBe('Please enter a valid email address')
    expect(validateEmail('@example.com')).toBe('Please enter a valid email address')
    expect(validateEmail('user@')).toBe('Please enter a valid email address')
    // Note: user..name@example.com and 'user @example.com' may be valid per RFC 5322
    expect(validateEmail('user space@example.com')).toBe('Please enter a valid email address')
  })

  it('should trim whitespace before validation', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull()
    expect(validateEmail('  invalid  ')).toBe('Please enter a valid email address')
  })
})

describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
    expect(sanitizeInput('\tworld\n')).toBe('world')
  })

  it('should remove angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    expect(sanitizeInput('Normal text <tag>')).toBe('Normal text tag')
  })

  it('should remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('JavaScript:malicious()')).toBe('malicious()')
    expect(sanitizeInput('JAVASCRIPT:code()')).toBe('code()')
  })

  it('should remove inline event handlers', () => {
    expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeInput('onload=malicious()')).toBe('malicious()')
    expect(sanitizeInput('onerror=hack()')).toBe('hack()')
  })

  it('should handle combined attacks', () => {
    const malicious = '<img src=x onerror=alert(1)>'
    // The sanitizer removes angle brackets and onerror= attribute
    const result = sanitizeInput(malicious)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).not.toContain('onerror=')
  })

  it('should preserve safe text', () => {
    expect(sanitizeInput('John Doe')).toBe('John Doe')
    expect(sanitizeInput('user@example.com')).toBe('user@example.com')
    expect(sanitizeInput('Valid text with numbers 123')).toBe('Valid text with numbers 123')
  })
})

describe('validateFullName', () => {
  it('should accept valid full names', () => {
    expect(validateFullName('John Doe')).toBeNull()
    expect(validateFullName('Mary Jane Smith')).toBeNull()
    expect(validateFullName("O'Brien")).toBeNull()
    expect(validateFullName('Jean-Pierre')).toBeNull()
  })

  it('should reject empty name', () => {
    expect(validateFullName('')).toBe('Full name is required')
    expect(validateFullName('   ')).toBe('Full name is required')
  })

  it('should reject name shorter than 2 characters', () => {
    expect(validateFullName('A')).toBe('Full name must be at least 2 characters')
    expect(validateFullName(' X ')).toBe('Full name must be at least 2 characters')
  })

  it('should reject name longer than 100 characters', () => {
    const longName = 'A'.repeat(101)
    expect(validateFullName(longName)).toBe('Full name must not exceed 100 characters')
  })

  it('should reject names with invalid characters', () => {
    expect(validateFullName('John123')).toBe('Full name can only contain letters, spaces, hyphens, and apostrophes')
    expect(validateFullName('John@Doe')).toBe('Full name can only contain letters, spaces, hyphens, and apostrophes')
    expect(validateFullName('User!')).toBe('Full name can only contain letters, spaces, hyphens, and apostrophes')
  })

  it('should trim whitespace before validation', () => {
    expect(validateFullName('  John Doe  ')).toBeNull()
    expect(validateFullName('  A  ')).toBe('Full name must be at least 2 characters')
  })
})
