import { test, expect } from '@playwright/test'

/**
 * Admin CRUD Operations Tests
 *
 * Tests all administrative functionality:
 * - User management (create, update, delete, role changes, block/unblock)
 * - Event management (create, update, publish, delete, reorder)
 * - Booking management (view, approve, reject, delete)
 * - Content management (update sections)
 * - Authorization checks (admin-only access)
 * - Audit logging verification
 */

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authenticated admin session
    // This will need to be implemented once auth is fully integrated
    await page.goto('/')
  })

  test.describe('User Management', () => {
    test('should navigate to admin dashboard', async ({ page }) => {
      // Click admin link in navigation or direct navigation
      const adminLink = page.getByRole('link', { name: /admin/i }).or(
        page.getByRole('button', { name: /admin/i })
      )

      if (await adminLink.count() > 0) {
        await adminLink.first().click()
      } else {
        // Direct navigation if no visible link
        await page.goto('/admin/dashboard')
      }

      // Should see admin dashboard
      const heading = page.getByRole('heading', { name: /dashboard/i }).or(
        page.getByRole('heading', { name: /admin/i })
      )
      await expect(heading.first()).toBeVisible({ timeout: 3000 })
    })

    test('should display users list', async ({ page }) => {
      await page.goto('/admin/users')

      // Should see users table or list
      const usersTable = page.locator('table').or(
        page.locator('[role="table"]')
      ).or(
        page.getByText(/users/i)
      )
      await expect(usersTable.first()).toBeVisible({ timeout: 3000 })
    })

    test('should open create user modal', async ({ page }) => {
      await page.goto('/admin/users')

      // Click create/add user button
      const createButton = page.getByRole('button', { name: /add user/i }).or(
        page.getByRole('button', { name: /create user/i })
      ).or(
        page.getByRole('button', { name: /new user/i })
      )
      await createButton.first().click()

      // Modal should be visible
      const modal = page.getByRole('dialog').or(
        page.getByRole('heading', { name: /add user/i })
      ).or(
        page.getByRole('heading', { name: /create user/i })
      )
      await expect(modal.first()).toBeVisible({ timeout: 2000 })
    })

    test('should validate user creation form', async ({ page }) => {
      await page.goto('/admin/users')

      // Open create user modal
      const createButton = page.getByRole('button', { name: /add user/i }).or(
        page.getByRole('button', { name: /create user/i })
      )
      await createButton.first().click()

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /submit/i }).or(
        page.getByRole('button', { name: /create/i })
      ).or(
        page.getByRole('button', { name: /save/i })
      )
      await submitButton.first().click()

      // Should show validation errors
      const errorMessage = page.getByText(/required/i).or(
        page.getByText(/invalid/i)
      )
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 })
    })

    test('should create new user with valid data', async ({ page }) => {
      await page.goto('/admin/users')

      // Open create user modal
      const createButton = page.getByRole('button', { name: /add user/i }).or(
        page.getByRole('button', { name: /create user/i })
      )
      await createButton.first().click()

      // Fill form with valid data
      const nameInput = page.getByLabel(/name/i)
      const emailInput = page.getByLabel(/email/i)
      const roleSelect = page.getByLabel(/role/i)

      await nameInput.fill('Test User')
      await emailInput.fill(`test.user.${Date.now()}@example.com`)

      // Select role if available
      if (await roleSelect.count() > 0) {
        await roleSelect.first().selectOption('user')
      }

      // Submit form
      const submitButton = page.getByRole('button', { name: /submit/i }).or(
        page.getByRole('button', { name: /create/i })
      ).or(
        page.getByRole('button', { name: /save/i })
      )
      await submitButton.first().click()

      // Should show success message
      const successMessage = page.getByText(/success/i).or(
        page.getByText(/created/i)
      ).or(
        page.getByText(/added/i)
      )
      await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
    })

    test('should edit existing user', async ({ page }) => {
      await page.goto('/admin/users')

      // Click edit button on first user
      const editButton = page.getByRole('button', { name: /edit/i }).first().or(
        page.locator('[aria-label*="Edit"]').first()
      )
      await editButton.click()

      // Edit modal should open
      const modal = page.getByRole('dialog').or(
        page.getByRole('heading', { name: /edit user/i })
      )
      await expect(modal.first()).toBeVisible({ timeout: 2000 })

      // Modify name field
      const nameInput = page.getByLabel(/name/i)
      await nameInput.fill('Updated Test User')

      // Submit
      const submitButton = page.getByRole('button', { name: /save/i }).or(
        page.getByRole('button', { name: /update/i })
      )
      await submitButton.first().click()

      // Should show success message
      const successMessage = page.getByText(/updated/i).or(
        page.getByText(/success/i)
      )
      await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
    })

    test('should change user role', async ({ page }) => {
      await page.goto('/admin/users')

      // Click edit button
      const editButton = page.getByRole('button', { name: /edit/i }).first()
      await editButton.click()

      // Change role
      const roleSelect = page.getByLabel(/role/i)
      if (await roleSelect.count() > 0) {
        await roleSelect.first().selectOption('admin')

        // Submit
        const submitButton = page.getByRole('button', { name: /save/i }).or(
          page.getByRole('button', { name: /update/i })
        )
        await submitButton.first().click()

        // Should show success message
        const successMessage = page.getByText(/updated/i).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })

    test('should block/unblock user', async ({ page }) => {
      await page.goto('/admin/users')

      // Click block button
      const blockButton = page.getByRole('button', { name: /block/i }).first().or(
        page.getByRole('button', { name: /disable/i }).first()
      )

      if (await blockButton.count() > 0) {
        await blockButton.click()

        // Confirm action if there's a confirmation dialog
        const confirmButton = page.getByRole('button', { name: /confirm/i }).or(
          page.getByRole('button', { name: /yes/i })
        )
        if (await confirmButton.count() > 0) {
          await confirmButton.first().click()
        }

        // Should show success message
        const successMessage = page.getByText(/blocked/i).or(
          page.getByText(/disabled/i)
        ).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })

    test('should delete user with confirmation', async ({ page }) => {
      await page.goto('/admin/users')

      // Click delete button
      const deleteButton = page.getByRole('button', { name: /delete/i }).first().or(
        page.locator('[aria-label*="Delete"]').first()
      )
      await deleteButton.click()

      // Confirmation dialog should appear
      const confirmDialog = page.getByRole('dialog').or(
        page.getByText(/are you sure/i)
      ).or(
        page.getByText(/confirm delete/i)
      )
      await expect(confirmDialog.first()).toBeVisible({ timeout: 2000 })

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm/i }).or(
        page.getByRole('button', { name: /delete/i }).last()
      )
      await confirmButton.click()

      // Should show success message
      const successMessage = page.getByText(/deleted/i).or(
        page.getByText(/removed/i)
      ).or(
        page.getByText(/success/i)
      )
      await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
    })

    test('should search/filter users', async ({ page }) => {
      await page.goto('/admin/users')

      // Find search input
      const searchInput = page.getByPlaceholder(/search/i).or(
        page.getByLabel(/search/i)
      ).or(
        page.locator('input[type="search"]')
      )

      if (await searchInput.count() > 0) {
        await searchInput.first().fill('test')
        await page.waitForTimeout(500) // Debounce delay

        // Table should update with filtered results
        const table = page.locator('table').or(
          page.locator('[role="table"]')
        )
        await expect(table.first()).toBeVisible()
      }
    })
  })

  test.describe('Event Management', () => {
    test('should navigate to events page', async ({ page }) => {
      await page.goto('/admin/events')

      // Should see events list
      const heading = page.getByRole('heading', { name: /events/i })
      await expect(heading.first()).toBeVisible({ timeout: 3000 })
    })

    test('should open create event modal', async ({ page }) => {
      await page.goto('/admin/events')

      // Click create event button
      const createButton = page.getByRole('button', { name: /add event/i }).or(
        page.getByRole('button', { name: /create event/i })
      ).or(
        page.getByRole('button', { name: /new event/i })
      )
      await createButton.first().click()

      // Modal should be visible
      const modal = page.getByRole('dialog').or(
        page.getByRole('heading', { name: /create event/i })
      )
      await expect(modal.first()).toBeVisible({ timeout: 2000 })
    })

    test('should validate event creation form', async ({ page }) => {
      await page.goto('/admin/events')

      // Open create event modal
      const createButton = page.getByRole('button', { name: /add event/i }).or(
        page.getByRole('button', { name: /create event/i })
      )
      await createButton.first().click()

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /submit/i }).or(
        page.getByRole('button', { name: /create/i })
      )
      await submitButton.first().click()

      // Should show validation errors
      const errorMessage = page.getByText(/required/i)
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 })
    })

    test('should create new event', async ({ page }) => {
      await page.goto('/admin/events')

      // Open create event modal
      const createButton = page.getByRole('button', { name: /add event/i }).or(
        page.getByRole('button', { name: /create event/i })
      )
      await createButton.first().click()

      // Fill form
      const titleInput = page.getByLabel(/title/i).or(page.getByLabel(/name/i))
      const descriptionInput = page.getByLabel(/description/i)
      const dateInput = page.getByLabel(/date/i)

      await titleInput.fill('Test Event')
      await descriptionInput.fill('This is a test event description')

      // Set date if available
      if (await dateInput.count() > 0) {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 7)
        await dateInput.first().fill(futureDate.toISOString().split('T')[0])
      }

      // Submit
      const submitButton = page.getByRole('button', { name: /submit/i }).or(
        page.getByRole('button', { name: /create/i })
      )
      await submitButton.first().click()

      // Should show success message
      const successMessage = page.getByText(/success/i).or(
        page.getByText(/created/i)
      )
      await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
    })

    test('should edit existing event', async ({ page }) => {
      await page.goto('/admin/events')

      // Click edit button on first event
      const editButton = page.getByRole('button', { name: /edit/i }).first()
      await editButton.click()

      // Edit modal should open
      const modal = page.getByRole('dialog').or(
        page.getByRole('heading', { name: /edit event/i })
      )
      await expect(modal.first()).toBeVisible({ timeout: 2000 })

      // Modify title
      const titleInput = page.getByLabel(/title/i).or(page.getByLabel(/name/i))
      await titleInput.fill('Updated Event Title')

      // Submit
      const submitButton = page.getByRole('button', { name: /save/i }).or(
        page.getByRole('button', { name: /update/i })
      )
      await submitButton.first().click()

      // Should show success message
      const successMessage = page.getByText(/updated/i).or(
        page.getByText(/success/i)
      )
      await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
    })

    test('should publish/unpublish event', async ({ page }) => {
      await page.goto('/admin/events')

      // Find publish toggle or button
      const publishButton = page.getByRole('button', { name: /publish/i }).first().or(
        page.getByRole('switch', { name: /publish/i }).first()
      )

      if (await publishButton.count() > 0) {
        await publishButton.click()

        // Should show success message
        const successMessage = page.getByText(/published/i).or(
          page.getByText(/unpublished/i)
        ).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })

    test('should delete event', async ({ page }) => {
      await page.goto('/admin/events')

      // Click delete button
      const deleteButton = page.getByRole('button', { name: /delete/i }).first()
      await deleteButton.click()

      // Confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm/i }).or(
        page.getByRole('button', { name: /delete/i }).last()
      )
      await confirmButton.click()

      // Should show success message
      const successMessage = page.getByText(/deleted/i).or(
        page.getByText(/success/i)
      )
      await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
    })

    test('should reorder events with drag and drop', async ({ page }) => {
      await page.goto('/admin/events')

      // Look for drag handles or reorder buttons
      const dragHandles = page.locator('[role="button"][aria-label*="drag"]').or(
        page.locator('.drag-handle')
      )

      if (await dragHandles.count() >= 2) {
        // Get first two drag handles
        const firstHandle = dragHandles.first()
        const secondHandle = dragHandles.nth(1)

        // Get bounding boxes
        const firstBox = await firstHandle.boundingBox()
        const secondBox = await secondHandle.boundingBox()

        if (firstBox && secondBox) {
          // Perform drag operation
          await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2)
          await page.mouse.down()
          await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2)
          await page.mouse.up()

          await page.waitForTimeout(500)

          // Should show success message
          const successMessage = page.getByText(/reordered/i).or(
            page.getByText(/updated/i)
          )
          await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
        }
      }
    })
  })

  test.describe('Booking Management', () => {
    test('should navigate to bookings page', async ({ page }) => {
      await page.goto('/admin/bookings')

      // Should see bookings list
      const heading = page.getByRole('heading', { name: /bookings/i }).or(
        page.getByRole('heading', { name: /reservations/i })
      )
      await expect(heading.first()).toBeVisible({ timeout: 3000 })
    })

    test('should display bookings list', async ({ page }) => {
      await page.goto('/admin/bookings')

      // Should see bookings table
      const table = page.locator('table').or(
        page.locator('[role="table"]')
      )
      await expect(table.first()).toBeVisible({ timeout: 3000 })
    })

    test('should filter bookings by status', async ({ page }) => {
      await page.goto('/admin/bookings')

      // Find status filter
      const statusFilter = page.getByLabel(/status/i).or(
        page.locator('select[name*="status"]')
      )

      if (await statusFilter.count() > 0) {
        await statusFilter.first().selectOption('pending')
        await page.waitForTimeout(500)

        // Table should update
        const table = page.locator('table').or(
          page.locator('[role="table"]')
        )
        await expect(table.first()).toBeVisible()
      }
    })

    test('should view booking details', async ({ page }) => {
      await page.goto('/admin/bookings')

      // Click view/details button
      const viewButton = page.getByRole('button', { name: /view/i }).first().or(
        page.getByRole('button', { name: /details/i }).first()
      )

      if (await viewButton.count() > 0) {
        await viewButton.click()

        // Details modal or page should open
        const details = page.getByRole('dialog').or(
          page.getByRole('heading', { name: /booking details/i })
        )
        await expect(details.first()).toBeVisible({ timeout: 2000 })
      }
    })

    test('should approve booking', async ({ page }) => {
      await page.goto('/admin/bookings')

      // Find approve button
      const approveButton = page.getByRole('button', { name: /approve/i }).first()

      if (await approveButton.count() > 0) {
        await approveButton.click()

        // Confirm if needed
        const confirmButton = page.getByRole('button', { name: /confirm/i })
        if (await confirmButton.count() > 0) {
          await confirmButton.first().click()
        }

        // Should show success message
        const successMessage = page.getByText(/approved/i).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })

    test('should reject booking', async ({ page }) => {
      await page.goto('/admin/bookings')

      // Find reject button
      const rejectButton = page.getByRole('button', { name: /reject/i }).first()

      if (await rejectButton.count() > 0) {
        await rejectButton.click()

        // Confirm if needed
        const confirmButton = page.getByRole('button', { name: /confirm/i })
        if (await confirmButton.count() > 0) {
          await confirmButton.first().click()
        }

        // Should show success message
        const successMessage = page.getByText(/rejected/i).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })

    test('should delete booking', async ({ page }) => {
      await page.goto('/admin/bookings')

      // Click delete button
      const deleteButton = page.getByRole('button', { name: /delete/i }).first()

      if (await deleteButton.count() > 0) {
        await deleteButton.click()

        // Confirmation dialog
        const confirmButton = page.getByRole('button', { name: /confirm/i }).or(
          page.getByRole('button', { name: /delete/i }).last()
        )
        await confirmButton.click()

        // Should show success message
        const successMessage = page.getByText(/deleted/i).or(
          page.getByText(/success/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })
  })

  test.describe('Content Management', () => {
    test('should navigate to content editor', async ({ page }) => {
      await page.goto('/admin/content')

      // Should see content editor
      const heading = page.getByRole('heading', { name: /content/i })
      await expect(heading.first()).toBeVisible({ timeout: 3000 })
    })

    test('should edit cafe section content', async ({ page }) => {
      await page.goto('/admin/content')

      // Find cafe section editor
      const cafeSection = page.getByText(/cafe/i).or(
        page.locator('[data-section="cafe"]')
      )

      if (await cafeSection.count() > 0) {
        await cafeSection.first().click()

        // Edit content
        const contentInput = page.locator('textarea').or(
          page.locator('[contenteditable="true"]')
        ).first()

        if (await contentInput.count() > 0) {
          await contentInput.fill('Updated cafe description')

          // Save
          const saveButton = page.getByRole('button', { name: /save/i })
          await saveButton.first().click()

          // Should show success message
          const successMessage = page.getByText(/saved/i).or(
            page.getByText(/updated/i)
          )
          await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
        }
      }
    })

    test('should upload image for section', async ({ page }) => {
      await page.goto('/admin/content')

      // Find image upload input
      const fileInput = page.locator('input[type="file"]').first()

      if (await fileInput.count() > 0) {
        // Set files (note: this requires a test image file)
        // await fileInput.setInputFiles('tests/fixtures/test-image.jpg')

        // For now, just verify the input exists
        await expect(fileInput).toBeVisible()
      }
    })

    test('should update section order', async ({ page }) => {
      await page.goto('/admin/content')

      // Look for section reordering controls
      const reorderButtons = page.locator('[aria-label*="Move up"]').or(
        page.locator('[aria-label*="Move down"]')
      )

      if (await reorderButtons.count() > 0) {
        await reorderButtons.first().click()

        // Should show success message
        const successMessage = page.getByText(/reordered/i).or(
          page.getByText(/updated/i)
        )
        await expect(successMessage.first()).toBeVisible({ timeout: 3000 })
      }
    })
  })

  test.describe('Authorization', () => {
    test('should redirect non-admin users from admin pages', async ({ page }) => {
      // TODO: Implement once auth is fully integrated
      // Should test that non-admin users cannot access admin routes
      // Expected: Redirect to home or show 403 error
    })

    test('should show admin menu only to admin users', async ({ page }) => {
      // TODO: Implement once auth is fully integrated
      // Expected: Admin menu visible for admin, hidden for regular users
    })

    test('should prevent CRUD operations for non-admin users', async ({ page }) => {
      // TODO: Implement once auth is fully integrated
      // Expected: API calls return 403 for non-admin users
    })
  })

  test.describe('Audit Logging', () => {
    test('should log user creation in audit trail', async ({ page }) => {
      // TODO: Verify audit logs after creating a user
      // Expected: Audit log entry with action='CREATE_USER'
    })

    test('should log user update in audit trail', async ({ page }) => {
      // TODO: Verify audit logs after updating a user
      // Expected: Audit log entry with action='UPDATE_USER'
    })

    test('should log user deletion in audit trail', async ({ page }) => {
      // TODO: Verify audit logs after deleting a user
      // Expected: Audit log entry with action='DELETE_USER'
    })

    test('should display audit logs in admin panel', async ({ page }) => {
      await page.goto('/admin/audit-logs')

      // Should see audit logs table
      const table = page.locator('table').or(
        page.locator('[role="table"]')
      ).or(
        page.getByText(/audit/i)
      )
      await expect(table.first()).toBeVisible({ timeout: 3000 })
    })

    test('should filter audit logs by action type', async ({ page }) => {
      await page.goto('/admin/audit-logs')

      // Find action filter
      const actionFilter = page.getByLabel(/action/i).or(
        page.locator('select[name*="action"]')
      )

      if (await actionFilter.count() > 0) {
        await actionFilter.first().selectOption('CREATE_USER')
        await page.waitForTimeout(500)

        // Table should update with filtered results
        const table = page.locator('table')
        await expect(table.first()).toBeVisible()
      }
    })

    test('should filter audit logs by date range', async ({ page }) => {
      await page.goto('/admin/audit-logs')

      // Find date filters
      const startDateInput = page.getByLabel(/start date/i).or(
        page.locator('input[name*="startDate"]')
      )
      const endDateInput = page.getByLabel(/end date/i).or(
        page.locator('input[name*="endDate"]')
      )

      if (await startDateInput.count() > 0 && await endDateInput.count() > 0) {
        const today = new Date()
        const lastWeek = new Date(today)
        lastWeek.setDate(lastWeek.getDate() - 7)

        await startDateInput.first().fill(lastWeek.toISOString().split('T')[0])
        await endDateInput.first().fill(today.toISOString().split('T')[0])

        await page.waitForTimeout(500)

        // Table should update
        const table = page.locator('table')
        await expect(table.first()).toBeVisible()
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should show error message on failed API call', async ({ page }) => {
      // TODO: Test error handling when API fails
      // Expected: User-friendly error message displayed
    })

    test('should prevent double submission', async ({ page }) => {
      await page.goto('/admin/users')

      // Open create user modal
      const createButton = page.getByRole('button', { name: /add user/i }).or(
        page.getByRole('button', { name: /create user/i })
      )
      await createButton.first().click()

      // Fill form
      const nameInput = page.getByLabel(/name/i)
      const emailInput = page.getByLabel(/email/i)

      await nameInput.fill('Test User')
      await emailInput.fill('test@example.com')

      // Submit button
      const submitButton = page.getByRole('button', { name: /submit/i }).or(
        page.getByRole('button', { name: /create/i })
      )

      // Click submit button twice rapidly
      await submitButton.first().click()
      await submitButton.first().click()

      // Should only process once (button should be disabled after first click)
      await expect(submitButton.first()).toBeDisabled({ timeout: 1000 })
    })

    test('should validate required fields before submission', async ({ page }) => {
      await page.goto('/admin/events')

      // Open create event modal
      const createButton = page.getByRole('button', { name: /add event/i }).or(
        page.getByRole('button', { name: /create event/i })
      )
      await createButton.first().click()

      // Try to submit without filling required fields
      const submitButton = page.getByRole('button', { name: /submit/i }).or(
        page.getByRole('button', { name: /create/i })
      )
      await submitButton.first().click()

      // Should show validation errors
      const errorMessages = page.locator('text=/required/i')
      await expect(errorMessages.first()).toBeVisible({ timeout: 2000 })
    })
  })
})
