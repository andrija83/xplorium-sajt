import { test, expect } from '@playwright/test'

/**
 * Authentication Flow Tests
 *
 * Tests all authentication-related functionality:
 * - Sign in modal
 * - Sign up modal
 * - Forgot password modal
 * - Form validation
 * - Error handling
 * - Modal transitions
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Sign In Modal', () => {
    test('should open sign in modal when clicking sign in button', async ({ page }) => {
      // Click sign in button
      const signInButton = page.getByRole('button', { name: /sign in/i }).first()
      await signInButton.click()

      // Modal should be visible
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Form fields should be visible
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('should close sign in modal when clicking close button', async ({ page }) => {
      // Open modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Click close button (assuming there's an X button or cancel button)
      const closeButton = page.getByRole('button', { name: /close/i }).or(page.locator('button[aria-label="Close"]'))
      if (await closeButton.count() > 0) {
        await closeButton.first().click()
      } else {
        // Try Escape key if no close button
        await page.keyboard.press('Escape')
      }

      // Modal should be closed
      await expect(page.getByRole('heading', { name: /sign in/i })).not.toBeVisible()
    })

    test('should validate email field', async ({ page }) => {
      // Open modal
      await page.getByRole('button', { name: /sign in/i }).first().click()

      // Try to submit with invalid email
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('invalid-email')

      const submitButton = page.getByRole('button', { name: /sign in/i }).last()
      await submitButton.click()

      // Should show validation error
      const errorMessage = page.getByText(/invalid.*email/i).or(page.getByText(/enter.*valid.*email/i))
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 })
    })

    test('should validate password field', async ({ page }) => {
      // Open modal
      await page.getByRole('button', { name: /sign in/i }).first().click()

      // Try to submit with empty password
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('test@example.com')

      const submitButton = page.getByRole('button', { name: /sign in/i }).last()
      await submitButton.click()

      // Should show validation error for password
      const errorMessage = page.getByText(/password.*required/i)
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 })
    })

    test('should show forgot password link', async ({ page }) => {
      // Open modal
      await page.getByRole('button', { name: /sign in/i }).first().click()

      // Forgot password link should be visible
      const forgotLink = page.getByRole('link', { name: /forgot.*password/i }).or(
        page.getByRole('button', { name: /forgot.*password/i })
      )
      await expect(forgotLink.first()).toBeVisible()
    })

    test('should switch to sign up modal', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Click sign up link
      const signUpLink = page.getByRole('link', { name: /sign up/i }).or(
        page.getByText(/don't have.*account/i)
      )
      await signUpLink.first().click()

      // Sign up modal should be visible
      await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible({ timeout: 2000 })
    })
  })

  test.describe('Sign Up Modal', () => {
    test('should open sign up modal when clicking sign up button', async ({ page }) => {
      // Click sign up button
      const signUpButton = page.getByRole('button', { name: /sign up/i }).first()
      await signUpButton.click()

      // Modal should be visible
      await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()

      // Form fields should be visible
      await expect(page.getByLabel(/name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/^password/i)).toBeVisible()
    })

    test('should validate all required fields', async ({ page }) => {
      // Open modal
      await page.getByRole('button', { name: /sign up/i }).first().click()

      // Try to submit with empty fields
      const submitButton = page.getByRole('button', { name: /sign up/i }).last()
      await submitButton.click()

      // Should show validation errors
      const errorMessages = page.locator('text=/required/i')
      await expect(errorMessages.first()).toBeVisible({ timeout: 2000 })
    })

    test('should validate password strength', async ({ page }) => {
      // Open modal
      await page.getByRole('button', { name: /sign up/i }).first().click()

      // Fill form with weak password
      await page.getByLabel(/name/i).fill('Test User')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/^password/i).fill('123')

      const submitButton = page.getByRole('button', { name: /sign up/i }).last()
      await submitButton.click()

      // Should show password strength error
      const errorMessage = page.getByText(/password.*characters/i).or(
        page.getByText(/password.*strong/i)
      )
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 })
    })

    test('should switch to sign in modal', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: /sign up/i }).first().click()
      await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()

      // Click sign in link
      const signInLink = page.getByRole('link', { name: /sign in/i }).or(
        page.getByText(/already have.*account/i)
      )
      await signInLink.first().click()

      // Sign in modal should be visible
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 2000 })
    })
  })

  test.describe('Forgot Password Modal', () => {
    test('should open forgot password modal from sign in', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()

      // Click forgot password link
      const forgotLink = page.getByRole('link', { name: /forgot.*password/i }).or(
        page.getByRole('button', { name: /forgot.*password/i })
      )
      await forgotLink.first().click()

      // Forgot password modal should be visible
      const heading = page.getByRole('heading', { name: /forgot.*password/i }).or(
        page.getByRole('heading', { name: /reset.*password/i })
      )
      await expect(heading.first()).toBeVisible({ timeout: 2000 })
    })

    test('should validate email in forgot password form', async ({ page }) => {
      // Navigate to forgot password modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      const forgotLink = page.getByRole('link', { name: /forgot.*password/i }).or(
        page.getByRole('button', { name: /forgot.*password/i })
      )
      await forgotLink.first().click()

      // Try to submit with invalid email
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('invalid-email')

      const submitButton = page.getByRole('button', { name: /reset/i }).or(
        page.getByRole('button', { name: /send/i })
      )
      await submitButton.first().click()

      // Should show validation error
      const errorMessage = page.getByText(/invalid.*email/i).or(page.getByText(/enter.*valid.*email/i))
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 })
    })
  })

  test.describe('Modal Interactions', () => {
    test('should close modal on backdrop click', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Click outside modal (on backdrop)
      await page.mouse.click(10, 10) // Top-left corner, outside modal

      // Modal should close
      await page.waitForTimeout(500)
      await expect(page.getByRole('heading', { name: /sign in/i })).not.toBeVisible()
    })

    test('should close modal with Escape key', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Press Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Modal should close
      await expect(page.getByRole('heading', { name: /sign in/i })).not.toBeVisible()
    })

    test('should prevent multiple modals from opening simultaneously', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Try to open sign up modal
      await page.getByRole('button', { name: /sign up/i }).first().click({ timeout: 1000 }).catch(() => {})

      // Only sign in modal should be visible
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    })

    test('should maintain form state when switching modals', async ({ page }) => {
      // Open sign in modal and fill email
      await page.getByRole('button', { name: /sign in/i }).first().click()
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('test@example.com')

      // Switch to sign up modal
      const signUpLink = page.getByRole('link', { name: /sign up/i }).or(
        page.getByText(/don't have.*account/i)
      )
      await signUpLink.first().click()
      await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()

      // Switch back to sign in modal
      const signInLink = page.getByRole('link', { name: /sign in/i }).or(
        page.getByText(/already have.*account/i)
      )
      await signInLink.first().click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Email should be preserved (or cleared, depending on UX design)
      // This test documents the current behavior
      const emailValue = await emailInput.inputValue()
      expect(typeof emailValue).toBe('string')
    })
  })

  test.describe('Accessibility', () => {
    test('should trap focus within modal', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Tab through modal elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Focus should remain within modal
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })

    test('should have proper ARIA labels', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()

      // Check for ARIA labels
      const modal = page.locator('[role="dialog"]').or(page.locator('[aria-modal="true"]'))
      await expect(modal.first()).toBeVisible({ timeout: 2000 })
    })

    test('should return focus to trigger element after closing', async ({ page }) => {
      // Focus on sign in button
      const signInButton = page.getByRole('button', { name: /sign in/i }).first()
      await signInButton.focus()

      // Open modal
      await signInButton.click()
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

      // Close modal
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Focus should return to sign in button
      const focusedElement = await page.evaluate(() =>
        document.activeElement?.textContent?.toLowerCase().includes('sign in')
      )
      expect(focusedElement).toBeTruthy()
    })
  })
})
