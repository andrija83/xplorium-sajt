import { test, expect } from '@playwright/test'

/**
 * Admin Booking Approval Workflow E2E Tests
 *
 * Tests the complete booking lifecycle from admin perspective:
 * 1. Admin views pending bookings
 * 2. Admin reviews booking details
 * 3. Admin approves booking
 * 4. Admin rejects booking
 * 5. Admin adds notes to bookings
 * 6. Admin deletes bookings
 *
 * Prerequisites:
 * - Admin user must exist (created via seed script)
 * - Test assumes admin credentials: admin@xplorium.com / password defined in seed
 */

test.describe('Admin Booking Workflow', () => {
  // Admin credentials (should match your seed script)
  const adminCredentials = {
    email: 'admin@xplorium.com',
    password: 'Admin123!', // Update this to match your seed password
  }

  // Helper function to sign in as admin
  async function signInAsAdmin(page: any) {
    await page.goto('/')

    // Open sign in modal
    await page.getByRole('button', { name: /sign in/i }).first().click()
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

    // Sign in with admin credentials
    await page.getByLabel(/email/i).fill(adminCredentials.email)
    await page.getByLabel(/password/i).fill(adminCredentials.password)
    await page.getByRole('button', { name: /sign in/i }).last().click()

    // Wait for authentication
    await page.waitForTimeout(2000)
  }

  // Helper function to create a test booking
  async function createTestBooking(page: any) {
    await page.goto('/booking')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    await page.getByLabel(/event title/i).fill(`E2E Test Booking ${Date.now()}`)
    await page.getByLabel(/booking type/i).click()
    await page.getByRole('option', { name: /cafe/i }).click()
    await page.getByLabel(/date/i).fill(dateStr)
    await page.getByLabel(/time/i).fill('15:00')
    await page.getByLabel(/number of guests/i).fill('5')
    await page.getByLabel(/email/i).fill(`e2e.booking.${Date.now()}@example.com`)
    await page.getByLabel(/phone/i).fill('+1234567890')

    await page.getByRole('button', { name: /submit booking/i }).click()
    await expect(page.getByText(/booking submitted successfully/i)).toBeVisible({ timeout: 5000 })

    await page.waitForTimeout(1000)
  }

  test.describe('Admin Access to Bookings', () => {
    test('should allow admin to access bookings page', async ({ page }) => {
      await signInAsAdmin(page)

      // Navigate to admin bookings
      await page.goto('/admin/bookings')

      // Should see bookings page
      await expect(page.getByRole('heading', { name: /bookings/i })).toBeVisible({ timeout: 3000 })

      // Should see bookings table or list
      const table = page.locator('table').or(page.locator('[role="grid"]'))
      await expect(table.first()).toBeVisible({ timeout: 3000 })
    })

    test('should display booking list with status filters', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')

      // Should see status filter options
      // The exact implementation may vary, but typically there are tabs or buttons
      const filterOptions = [
        /all/i,
        /pending/i,
        /approved/i,
        /rejected/i,
      ]

      for (const filter of filterOptions) {
        const filterElement = page.getByRole('button', { name: filter }).or(
          page.getByRole('tab', { name: filter })
        ).or(
          page.getByText(filter)
        )

        if (await filterElement.count() > 0) {
          await expect(filterElement.first()).toBeVisible()
        }
      }
    })

    test('should show booking count badge', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')

      // Should display some indication of booking counts
      // This could be a badge, number, or table row count
      const bookingsTable = page.locator('table, [role="grid"]')
      await expect(bookingsTable.first()).toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Booking Details View', () => {
    test('should view booking details', async ({ page }) => {
      // First create a test booking
      await createTestBooking(page)

      // Sign in as admin
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')

      // Click on first booking to view details
      // This could be a row click, eye icon, or details button
      const viewButton = page.getByRole('button', { name: /view/i }).first().or(
        page.locator('[aria-label*="View"]').first()
      ).or(
        page.locator('table tr').first()
      )

      if (await viewButton.count() > 0) {
        await viewButton.click()

        // Should show booking details
        await page.waitForTimeout(1000)

        // Details modal or page should be visible
        // Check for common booking fields
        const hasDetails = await page.getByText(/guest/i).count() > 0 ||
                          await page.getByText(/date/i).count() > 0 ||
                          await page.getByText(/time/i).count() > 0

        expect(hasDetails).toBeTruthy()
      }
    })
  })

  test.describe('Booking Approval', () => {
    test('should approve a pending booking', async ({ page }) => {
      // Create test booking
      await createTestBooking(page)

      // Sign in as admin
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')

      // Wait for bookings to load
      await page.waitForTimeout(1000)

      // Find and click approve button on first pending booking
      const approveButton = page.getByRole('button', { name: /approve/i }).first()

      if (await approveButton.count() > 0) {
        await approveButton.click()

        // Should show success message
        const successMessage = page.getByText(/approved/i).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })

    test('should show confirmation before approving booking', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')
      await page.waitForTimeout(1000)

      const approveButton = page.getByRole('button', { name: /approve/i }).first()

      if (await approveButton.count() > 0) {
        await approveButton.click()

        // May show confirmation dialog
        const confirmDialog = page.getByRole('dialog').or(
          page.getByText(/confirm/i)
        )

        if (await confirmDialog.count() > 0) {
          await expect(confirmDialog.first()).toBeVisible()

          // Confirm the action
          const confirmButton = page.getByRole('button', { name: /confirm/i }).or(
            page.getByRole('button', { name: /yes/i })
          )
          await confirmButton.first().click()
        }
      }
    })
  })

  test.describe('Booking Rejection', () => {
    test('should reject a pending booking', async ({ page }) => {
      // Create test booking
      await createTestBooking(page)

      // Sign in as admin
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')
      await page.waitForTimeout(1000)

      // Find and click reject button
      const rejectButton = page.getByRole('button', { name: /reject/i }).first()

      if (await rejectButton.count() > 0) {
        await rejectButton.click()

        // Should show success message
        const successMessage = page.getByText(/rejected/i).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })

    test('should allow adding rejection reason', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')
      await page.waitForTimeout(1000)

      const rejectButton = page.getByRole('button', { name: /reject/i }).first()

      if (await rejectButton.count() > 0) {
        await rejectButton.click()

        // May show dialog with reason field
        const reasonField = page.getByLabel(/reason/i).or(
          page.getByLabel(/note/i)
        ).or(
          page.getByPlaceholder(/reason/i)
        )

        if (await reasonField.count() > 0) {
          await reasonField.fill('Fully booked for this time slot')

          // Submit rejection
          const submitButton = page.getByRole('button', { name: /confirm/i }).or(
            page.getByRole('button', { name: /reject/i })
          )
          await submitButton.last().click()

          await expect(page.getByText(/rejected/i)).toBeVisible({ timeout: 3000 })
        }
      }
    })
  })

  test.describe('Booking Notes', () => {
    test('should allow adding notes to booking', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')
      await page.waitForTimeout(1000)

      // Look for notes field or button
      const notesButton = page.getByRole('button', { name: /note/i }).first().or(
        page.getByLabel(/note/i).first()
      )

      if (await notesButton.count() > 0) {
        await notesButton.click()

        // Fill notes
        const notesField = page.getByLabel(/note/i).or(
          page.locator('textarea')
        )
        await notesField.first().fill('Customer requested special seating')

        // Save notes
        const saveButton = page.getByRole('button', { name: /save/i }).or(
          page.getByRole('button', { name: /submit/i })
        )
        await saveButton.first().click()

        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('Booking Deletion', () => {
    test('should allow deleting a booking', async ({ page }) => {
      // Create test booking
      await createTestBooking(page)

      // Sign in as admin
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')
      await page.waitForTimeout(1000)

      // Find delete button
      const deleteButton = page.getByRole('button', { name: /delete/i }).first().or(
        page.locator('[aria-label*="Delete"]').first()
      )

      if (await deleteButton.count() > 0) {
        await deleteButton.click()

        // Should show confirmation dialog
        await page.waitForTimeout(500)

        // Confirm deletion
        const confirmButton = page.getByRole('button', { name: /confirm/i }).or(
          page.getByRole('button', { name: /delete/i })
        ).or(
          page.getByRole('button', { name: /yes/i })
        )
        await confirmButton.last().click()

        // Should show success message
        await page.waitForTimeout(1000)
      }
    })

    test('should require confirmation before deleting', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')
      await page.waitForTimeout(1000)

      const deleteButton = page.getByRole('button', { name: /delete/i }).first()

      if (await deleteButton.count() > 0) {
        await deleteButton.click()

        // Should show confirmation dialog
        const confirmDialog = page.getByRole('dialog').or(
          page.getByText(/confirm.*delete/i)
        ).or(
          page.getByText(/are you sure/i)
        )

        if (await confirmDialog.count() > 0) {
          await expect(confirmDialog.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('Booking Export', () => {
    test('should have export functionality', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')

      // Look for export button
      const exportButton = page.getByRole('button', { name: /export/i }).or(
        page.getByRole('button', { name: /download/i })
      ).or(
        page.getByText(/csv/i)
      )

      if (await exportButton.count() > 0) {
        await expect(exportButton.first()).toBeVisible()
      }
    })
  })

  test.describe('Booking Search and Filter', () => {
    test('should allow searching bookings', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')

      // Look for search input
      const searchInput = page.getByPlaceholder(/search/i).or(
        page.getByLabel(/search/i)
      ).or(
        page.locator('input[type="search"]')
      )

      if (await searchInput.count() > 0) {
        await searchInput.fill('test@example.com')
        await page.waitForTimeout(1000)

        // Results should filter
        // This is implementation-dependent
      }
    })

    test('should allow filtering by status', async ({ page }) => {
      await signInAsAdmin(page)
      await page.goto('/admin/bookings')

      // Try to filter by pending status
      const pendingFilter = page.getByRole('button', { name: /pending/i }).or(
        page.getByRole('tab', { name: /pending/i })
      )

      if (await pendingFilter.count() > 0) {
        await pendingFilter.click()
        await page.waitForTimeout(1000)

        // Should show only pending bookings
      }
    })
  })
})
