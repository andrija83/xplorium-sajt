/**
 * Unit Tests for Utility Functions
 */

import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (className utility)', () => {
  it('should merge single className', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('should merge multiple classNames', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classNames', () => {
    const isActive = true
    expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class')
  })

  it('should filter out falsy values', () => {
    expect(cn('text-red-500', false, 'bg-blue-500', null, undefined)).toBe('text-red-500 bg-blue-500')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    // tailwind-merge should keep the last conflicting class
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('should handle array of classNames', () => {
    expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500')
  })

  it('should handle object syntax for conditional classes', () => {
    expect(cn({
      'text-red-500': true,
      'bg-blue-500': false,
      'p-4': true
    })).toBe('text-red-500 p-4')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should handle complex nesting', () => {
    const result = cn(
      'base',
      ['nested', 'array'],
      {
        'conditional': true,
        'excluded': false
      },
      true && 'included'
    )
    expect(result).toContain('base')
    expect(result).toContain('nested')
    expect(result).toContain('array')
    expect(result).toContain('conditional')
    expect(result).toContain('included')
    expect(result).not.toContain('excluded')
  })

  it('should properly deduplicate identical classes', () => {
    expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500')
  })

  it('should handle responsive and variant classes', () => {
    expect(cn('text-base', 'md:text-lg', 'lg:text-xl')).toBe('text-base md:text-lg lg:text-xl')
  })

  it('should handle hover and state variants', () => {
    expect(cn('bg-blue-500', 'hover:bg-blue-600', 'active:bg-blue-700')).toBe('bg-blue-500 hover:bg-blue-600 active:bg-blue-700')
  })
})
