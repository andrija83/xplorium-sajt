/**
 * Unit Tests for Auth Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Role } from '@/types'
import {
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  hasRole,
  isAdmin,
  getCurrentSession,
  requireAuth,
  isResourceOwner,
  requireOwnerOrAdmin
} from './auth-utils'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}))

import { auth } from '@/lib/auth'

describe('requireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return session when user has required role', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        role: Role.ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireRole([Role.ADMIN, Role.SUPER_ADMIN])
    expect(result).toEqual(mockSession)
  })

  it('should throw error when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    await expect(requireRole([Role.ADMIN])).rejects.toThrow('Unauthorized: Not authenticated')
  })

  it('should throw error when user does not have required role', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'customer@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    await expect(requireRole([Role.ADMIN])).rejects.toThrow('Unauthorized: Requires one of roles')
  })

  it('should accept any of multiple allowed roles', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'super@example.com',
        role: Role.SUPER_ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireRole([Role.ADMIN, Role.SUPER_ADMIN])
    expect(result).toEqual(mockSession)
  })
})

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow ADMIN role', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: Role.ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireAdmin()
    expect(result).toEqual(mockSession)
  })

  it('should allow SUPER_ADMIN role', async () => {
    const mockSession = {
      user: {
        id: 'super-1',
        email: 'super@example.com',
        role: Role.SUPER_ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireAdmin()
    expect(result).toEqual(mockSession)
  })

  it('should reject CUSTOMER role', async () => {
    const mockSession = {
      user: {
        id: 'customer-1',
        email: 'customer@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    await expect(requireAdmin()).rejects.toThrow('Unauthorized')
  })
})

describe('requireSuperAdmin', () => {
  it('should allow only SUPER_ADMIN role', async () => {
    const mockSession = {
      user: {
        id: 'super-1',
        email: 'super@example.com',
        role: Role.SUPER_ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireSuperAdmin()
    expect(result).toEqual(mockSession)
  })

  it('should reject ADMIN role', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: Role.ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    await expect(requireSuperAdmin()).rejects.toThrow('Unauthorized')
  })
})

describe('hasRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when user has role', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: Role.ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await hasRole([Role.ADMIN])
    expect(result).toBe(true)
  })

  it('should return false when user does not have role', async () => {
    const mockSession = {
      user: {
        id: 'customer-1',
        email: 'customer@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await hasRole([Role.ADMIN])
    expect(result).toBe(false)
  })

  it('should return false when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await hasRole([Role.ADMIN])
    expect(result).toBe(false)
  })
})

describe('isAdmin', () => {
  it('should return true for ADMIN', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: Role.ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await isAdmin()
    expect(result).toBe(true)
  })

  it('should return true for SUPER_ADMIN', async () => {
    const mockSession = {
      user: {
        id: 'super-1',
        email: 'super@example.com',
        role: Role.SUPER_ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await isAdmin()
    expect(result).toBe(true)
  })

  it('should return false for CUSTOMER', async () => {
    const mockSession = {
      user: {
        id: 'customer-1',
        email: 'customer@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await isAdmin()
    expect(result).toBe(false)
  })
})

describe('getCurrentSession', () => {
  it('should return session when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await getCurrentSession()
    expect(result).toEqual(mockSession)
  })

  it('should return null when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await getCurrentSession()
    expect(result).toBeNull()
  })
})

describe('requireAuth', () => {
  it('should return session when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireAuth()
    expect(result).toEqual(mockSession)
  })

  it('should throw error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    await expect(requireAuth()).rejects.toThrow('Unauthorized: Authentication required')
  })
})

describe('isResourceOwner', () => {
  it('should return true when user owns resource', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'owner@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await isResourceOwner('user-123')
    expect(result).toBe(true)
  })

  it('should return false when user does not own resource', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'owner@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await isResourceOwner('user-456')
    expect(result).toBe(false)
  })

  it('should return false when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await isResourceOwner('user-123')
    expect(result).toBe(false)
  })
})

describe('requireOwnerOrAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow resource owner', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'owner@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireOwnerOrAdmin('user-123')
    expect(result).toEqual(mockSession)
  })

  it('should allow admin even if not owner', async () => {
    const mockSession = {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        role: Role.ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireOwnerOrAdmin('user-123')
    expect(result).toEqual(mockSession)
  })

  it('should allow super admin even if not owner', async () => {
    const mockSession = {
      user: {
        id: 'super-1',
        email: 'super@example.com',
        role: Role.SUPER_ADMIN
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    const result = await requireOwnerOrAdmin('user-123')
    expect(result).toEqual(mockSession)
  })

  it('should reject non-owner non-admin', async () => {
    const mockSession = {
      user: {
        id: 'user-456',
        email: 'other@example.com',
        role: Role.CUSTOMER
      }
    }

    vi.mocked(auth).mockResolvedValue(mockSession as any)

    await expect(requireOwnerOrAdmin('user-123')).rejects.toThrow('Unauthorized: Must be resource owner or admin')
  })
})
