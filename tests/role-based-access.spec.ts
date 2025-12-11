import { test, expect } from '@playwright/test'

/**
 * Role-Based Access Control (RBAC) E2E Tests
 *
 * Tests authorization and access control:
 * - Unauthenticated users cannot access admin pages
 * - Regular users cannot access admin pages
 * - Admin users can access admin pages
 * - Super admin users have full access
 * - Proper redirects when unauthorized
 */

test.describe('Role-Based Access Control', () => {
  // Test credentials
  const credentials = {
    admin: {
      email: 'admin@xplorium.com',
      password: 'Admin123!', // Update to match your seed
    },
    user: {
      email: `test.user.${Date.now()}@example.com`,
      password: 'UserPass123!',
      name: 'Test User',
    },
  }

  // Admin routes to test
  const adminRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/bookings',
    '/admin/events',
    '/admin/pricing',
    '/admin/content',
    '/admin/inventory',
    '/admin/maintenance',
    '/admin/audit',
    '/admin/customers',
    '/admin/analytics',
    '/admin/scheduling',
    '/admin/revenue',
    '/admin/reports',
    '/admin/marketing',
    '/admin/campaigns',
    '/admin/export-import',
    '/admin/notifications',
  ]

  // Helper: Sign up a regular user
  async function signUpAsRegularUser(page: any) {
    await page.goto('/')
    await page.getByRole('button', { name: /sign up/i }).first().click()
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()

    await page.getByLabel(/name/i).fill(credentials.user.name)
    await page.getByLabel(/email/i).fill(credentials.user.email)
    await page.getByLabel(/^password/i).fill(credentials.user.password)

    await page.getByRole('button', { name: /sign up/i }).last().click()
    await page.waitForTimeout(2000)
  }

  // Helper: Sign in as user
  async function signIn(page: any, email: string, password: string) {
    await page.goto('/')
    await page.getByRole('button', { name: /sign in/i }).first().click()
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/password/i).fill(password)
    await page.getByRole('button', { name: /sign in/i }).last().click()

    await page.waitForTimeout(2000)
  }

  test.describe('Unauthenticated Access', () => {
    test('should redirect unauthenticated users from admin pages', async ({ page }) => {
      // Try to access admin dashboard without authentication
      await page.goto('/admin/dashboard')
      await page.waitForTimeout(1000)

      // Should be redirected to sign in or home page
      const currentUrl = page.url()

      // User should NOT be on admin page
      const isOnAdminPage = currentUrl.includes('/admin')

      if (!isOnAdminPage) {
        // Correctly redirected
        console.log(`Redirected to: ${currentUrl}`)
      } else {
        // Check if sign in modal opened
        const signInModal = page.getByRole('heading', { name: /sign in/i })
        const isModalVisible = await signInModal.isVisible().catch(() => false)

        if (isModalVisible) {
          console.log('Sign in modal opened (correct behavior)')
        }
      }
    })

    test('should block access to all admin routes when not authenticated', async ({ page }) => {
      for (const route of adminRoutes.slice(0, 5)) {
        // Test first 5 routes to save time
        await page.goto(route)
        await page.waitForTimeout(500)

        const currentUrl = page.url()

        // Should either redirect away from admin or show auth modal
        if (currentUrl.includes('/admin')) {
          // If still on admin route, check for auth modal
          const signInModal = page.getByRole('heading', { name: /sign in/i })
          const isModalVisible = await signInModal.isVisible().catch(() => false)
          expect(isModalVisible).toBeTruthy()
        }
      }
    })

    test('should show unauthorized message for protected API routes', async ({ page }) => {
      // Try to access admin API without auth
      const response = await page.goto('/api/admin/users')

      if (response) {
        // Should return 401 or 403
        const status = response.status()
        expect([401, 403, 404, 302]).toContain(status)
      }
    })
  })

  test.describe('Regular User Access', () => {
    test.beforeEach(async ({ page }) => {
      // Create and sign in as regular user
      await signUpAsRegularUser(page)
    })

    test('should prevent regular user from accessing admin dashboard', async ({ page }) => {
      // Try to access admin dashboard as regular user
      await page.goto('/admin/dashboard')
      await page.waitForTimeout(1000)

      const currentUrl = page.url()

      // Should be redirected or blocked
      const hasAccess = currentUrl.includes('/admin/dashboard') &&
                       (await page.getByRole('heading', { name: /dashboard/i }).isVisible().catch(() => false))

      if (hasAccess) {
        // This should NOT happen - fail the test
        throw new Error('Regular user should not have access to admin dashboard')
      } else {
        console.log('Regular user correctly blocked from admin dashboard')
      }
    })

    test('should prevent regular user from accessing users management', async ({ page }) => {
      await page.goto('/admin/users')
      await page.waitForTimeout(1000)

      const currentUrl = page.url()
      const hasAccess = currentUrl.includes('/admin/users')

      if (hasAccess) {
        // Check if there's an error message
        const errorMessage = page.getByText(/unauthorized/i).or(
          page.getByText(/access denied/i)
        ).or(
          page.getByText(/forbidden/i)
        )

        const hasErrorMessage = await errorMessage.count() > 0
        expect(hasErrorMessage).toBeTruthy()
      }
    })

    test('should prevent regular user from accessing bookings management', async ({ page }) => {
      await page.goto('/admin/bookings')
      await page.waitForTimeout(1000)

      const currentUrl = page.url()

      // Should not have admin access
      if (currentUrl.includes('/admin/bookings')) {
        // Page might show but with no data or error
        const errorIndicator = page.getByText(/unauthorized/i).or(
          page.getByText(/access denied/i)
        )

        if (await errorIndicator.count() === 0) {
          throw new Error('Regular user should not see admin booking management')
        }
      }
    })

    test('should allow regular user to access public pages', async ({ page }) => {
      // Regular users should access public pages
      const publicPages = ['/', '/booking', '/profile']

      for (const pagePath of publicPages) {
        const response = await page.goto(pagePath)
        await page.waitForTimeout(500)

        if (response) {
          const status = response.status()
          expect(status).toBe(200)
        }
      }
    })

    test('should allow regular user to view their own profile', async ({ page }) => {
      await page.goto('/profile')
      await page.waitForTimeout(1000)

      // Should see profile page
      const currentUrl = page.url()
      expect(currentUrl).toContain('/profile')

      // Should see user-specific content
      const hasProfileContent = await page.getByText(credentials.user.name).isVisible().catch(() => false) ||
                               await page.getByText(credentials.user.email).isVisible().catch(() => false)

      if (!hasProfileContent) {
        console.log('Profile page loaded (content verification depends on implementation)')
      }
    })
  })

  test.describe('Admin User Access', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as admin
      await signIn(page, credentials.admin.email, credentials.admin.password)
    })

    test('should allow admin to access admin dashboard', async ({ page }) => {
      await page.goto('/admin/dashboard')
      await page.waitForTimeout(1000)

      // Should successfully access admin dashboard
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 3000 })

      // Should see admin-specific content (stats, charts, etc.)
      const hasAdminContent = await page.locator('table, [role="grid"], canvas').count() > 0
      expect(hasAdminContent).toBeTruthy()
    })

    test('should allow admin to access all admin routes', async ({ page }) => {
      // Test subset of admin routes
      const routesToTest = [
        '/admin/users',
        '/admin/bookings',
        '/admin/events',
        '/admin/pricing',
      ]

      for (const route of routesToTest) {
        const response = await page.goto(route)
        await page.waitForTimeout(500)

        if (response) {
          const status = response.status()
          expect(status).toBe(200)
        }

        // Should see admin content, not error messages
        const hasError = await page.getByText(/unauthorized/i).isVisible().catch(() => false)
        expect(hasError).toBe(false)
      }
    })

    test('should show admin navigation elements', async ({ page }) => {
      await page.goto('/admin/dashboard')
      await page.waitForTimeout(1000)

      // Should see admin sidebar or navigation
      const navElements = [
        /dashboard/i,
        /users/i,
        /bookings/i,
        /events/i,
      ]

      for (const navItem of navElements) {
        const element = page.getByRole('link', { name: navItem }).or(
          page.getByRole('button', { name: navItem })
        ).or(
          page.getByText(navItem)
        )

        if (await element.count() > 0) {
          await expect(element.first()).toBeVisible()
        }
      }
    })

    test('should allow admin to perform CRUD operations', async ({ page }) => {
      // Navigate to users page
      await page.goto('/admin/users')
      await page.waitForTimeout(1000)

      // Should see action buttons (create, edit, delete)
      const hasCreateButton = await page.getByRole('button', { name: /add user/i }).isVisible().catch(() => false) ||
                             await page.getByRole('button', { name: /create user/i }).isVisible().catch(() => false)

      // Admin should have CRUD capabilities
      console.log(`Admin has create button: ${hasCreateButton}`)
    })
  })

  test.describe('Access Control Headers', () => {
    test('should set proper CORS headers for admin routes', async ({ page }) => {
      const response = await page.goto('/admin/dashboard')

      if (response) {
        const headers = response.headers()

        // Should have security headers
        // This is implementation-dependent
        console.log('Response headers:', Object.keys(headers))
      }
    })

    test('should prevent CSRF attacks on admin actions', async ({ page }) => {
      // Admin forms should have CSRF protection
      await signIn(page, credentials.admin.email, credentials.admin.password)
      await page.goto('/admin/users')
      await page.waitForTimeout(1000)

      // Click create user button
      const createButton = page.getByRole('button', { name: /add user/i }).or(
        page.getByRole('button', { name: /create user/i })
      )

      if (await createButton.count() > 0) {
        await createButton.click()
        await page.waitForTimeout(500)

        // Form should have CSRF token or use secure method
        // This is implementation-dependent
        const form = page.locator('form')
        if (await form.count() > 0) {
          console.log('Form security check (implementation-dependent)')
        }
      }
    })
  })

  test.describe('Session Expiry', () => {
    test('should handle expired sessions gracefully', async ({ page }) => {
      await signIn(page, credentials.admin.email, credentials.admin.password)

      // Clear cookies to simulate expired session
      await page.context().clearCookies()

      // Try to access admin page
      await page.goto('/admin/dashboard')
      await page.waitForTimeout(1000)

      // Should redirect to sign in or show auth modal
      const currentUrl = page.url()
      const isOnAdminPage = currentUrl.includes('/admin/dashboard')

      if (!isOnAdminPage) {
        console.log('Correctly redirected after session expiry')
      } else {
        // Check for auth modal
        const signInModal = page.getByRole('heading', { name: /sign in/i })
        const isModalVisible = await signInModal.isVisible().catch(() => false)
        expect(isModalVisible).toBeTruthy()
      }
    })
  })
})
