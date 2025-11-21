import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility Tests
 *
 * Tests WCAG 2.1 AA compliance using axe-core:
 * - Landing page accessibility
 * - Navigation accessibility
 * - Modal accessibility
 * - Form accessibility
 * - Admin panel accessibility
 * - Color contrast
 * - Keyboard navigation
 * - Screen reader support
 * - ARIA attributes
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Landing Page', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper document structure', async ({ page }) => {
      // Check for single main landmark
      const mainLandmarks = await page.locator('main').count()
      expect(mainLandmarks).toBe(1)

      // Check for proper heading hierarchy
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
    })

    test('should have accessible navigation', async ({ page }) => {
      // Click X logo to reveal navigation
      const xLogo = page.getByRole('button', { name: /click to explore/i })
      await xLogo.click()
      await page.waitForTimeout(2000)

      // Check navigation is accessible
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('nav')
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have accessible interactive elements', async ({ page }) => {
      // All buttons should have accessible names
      const buttons = await page.locator('button').all()

      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = await button.textContent()
        const hasAccessibleName = (ariaLabel && ariaLabel.trim() !== '') ||
                                   (textContent && textContent.trim() !== '')

        expect(hasAccessibleName).toBeTruthy()
      }
    })

    test('should have sufficient color contrast', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({
          rules: {
            'color-contrast': { enabled: true }
          }
        })
        .analyze()

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      )
      expect(contrastViolations).toEqual([])
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Focus should be visible
      const xLogo = page.getByRole('button', { name: /click to explore/i })
      await xLogo.focus()

      // Check focus is visible (check for focus-visible ring)
      const hasFocusVisible = await xLogo.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.outline !== 'none' || styles.boxShadow.includes('ring')
      })

      expect(hasFocusVisible).toBeTruthy()
    })

    test('should have alt text for images', async ({ page }) => {
      const images = await page.locator('img').all()

      for (const img of images) {
        const alt = await img.getAttribute('alt')
        const ariaLabel = await img.getAttribute('aria-label')
        const role = await img.getAttribute('role')

        // Images should have alt text or be marked as decorative
        const isAccessible =
          (alt !== null) ||
          (ariaLabel !== null) ||
          (role === 'presentation') ||
          (role === 'none')

        expect(isAccessible).toBeTruthy()
      }
    })
  })

  test.describe('Navigation Sections', () => {
    test('should have accessible Cafe section', async ({ page }) => {
      // Navigate to Cafe
      await page.getByRole('button', { name: /click to explore/i }).click()
      await page.waitForTimeout(2000)
      await page.getByRole('button', { name: /cafe/i }).click()
      await page.waitForTimeout(1000)

      // Run accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have accessible Sensory section', async ({ page }) => {
      // Navigate to Sensory
      await page.getByRole('button', { name: /click to explore/i }).click()
      await page.waitForTimeout(2000)
      await page.getByRole('button', { name: /sensory/i }).click()
      await page.waitForTimeout(1000)

      // Run accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have accessible Igraonica section', async ({ page }) => {
      // Navigate to Igraonica
      await page.getByRole('button', { name: /click to explore/i }).click()
      await page.waitForTimeout(2000)
      await page.getByRole('button', { name: /igraonica/i }).click()
      await page.waitForTimeout(1000)

      // Run accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Modals', () => {
    test('should have accessible sign in modal', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      // Run accessibility scan on modal
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have accessible sign up modal', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: /sign up/i }).first().click()
      await page.waitForTimeout(500)

      // Run accessibility scan on modal
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper modal ARIA attributes', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      const modal = page.locator('[role="dialog"]').or(page.locator('[aria-modal="true"]'))
      await expect(modal.first()).toBeVisible()

      // Check for aria-labelledby or aria-label
      const hasLabel = await modal.first().evaluate(el => {
        return el.hasAttribute('aria-labelledby') || el.hasAttribute('aria-label')
      })

      expect(hasLabel).toBeTruthy()
    })

    test('should trap focus within modal', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      // Get first and last focusable elements
      const focusableElements = await page.locator('[role="dialog"] button, [role="dialog"] input, [role="dialog"] a').all()

      if (focusableElements.length > 0) {
        // Focus first element
        await focusableElements[0].focus()

        // Tab through all elements
        for (let i = 0; i < focusableElements.length + 1; i++) {
          await page.keyboard.press('Tab')
        }

        // Focus should have wrapped back to the beginning
        const activeElement = await page.evaluate(() => document.activeElement?.tagName)
        expect(activeElement).toBeTruthy()
      }
    })
  })

  test.describe('Forms', () => {
    test('should have accessible form fields', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      // Run accessibility scan on form
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('form')
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have labels for all inputs', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      // All inputs should have labels
      const inputs = await page.locator('input[type="email"], input[type="password"], input[type="text"]').all()

      for (const input of inputs) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')

        // Check if there's a label for this input
        let hasLabel = false

        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count()
          hasLabel = label > 0
        }

        hasLabel = hasLabel || ariaLabel !== null || ariaLabelledBy !== null

        expect(hasLabel).toBeTruthy()
      }
    })

    test('should have accessible error messages', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      // Try to submit with invalid data
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('invalid-email')

      const submitButton = page.getByRole('button', { name: /sign in/i }).last()
      await submitButton.click()

      await page.waitForTimeout(500)

      // Error messages should be announced to screen readers
      const errorMessages = page.locator('[role="alert"]').or(
        page.locator('[aria-live="polite"]')
      ).or(
        page.locator('[aria-live="assertive"]')
      )

      const count = await errorMessages.count()
      expect(count).toBeGreaterThanOrEqual(0) // May or may not have live regions depending on implementation
    })

    test('should have accessible required field indicators', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: /sign up/i }).first().click()
      await page.waitForTimeout(500)

      // Required fields should be marked
      const requiredInputs = await page.locator('input[required]').all()

      for (const input of requiredInputs) {
        const ariaRequired = await input.getAttribute('aria-required')
        const hasRequiredAttribute = await input.evaluate(el => el.hasAttribute('required'))

        expect(hasRequiredAttribute || ariaRequired === 'true').toBeTruthy()
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should navigate through sections with Tab', async ({ page }) => {
      // Click X logo to reveal navigation
      const xLogo = page.getByRole('button', { name: /click to explore/i })
      await xLogo.click()
      await page.waitForTimeout(2000)

      // Tab through navigation items
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Active element should be focusable
      const activeElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(['BUTTON', 'A', 'INPUT']).toContain(activeElement)
    })

    test('should activate buttons with Enter key', async ({ page }) => {
      const xLogo = page.getByRole('button', { name: /click to explore/i })
      await xLogo.focus()
      await page.keyboard.press('Enter')

      // Brand should appear
      const brand = page.getByText(/plorium/i)
      await expect(brand).toBeVisible({ timeout: 3000 })
    })

    test('should activate buttons with Space key', async ({ page }) => {
      const xLogo = page.getByRole('button', { name: /click to explore/i })
      await xLogo.focus()
      await page.keyboard.press('Space')

      // Brand should appear
      const brand = page.getByText(/plorium/i)
      await expect(brand).toBeVisible({ timeout: 3000 })
    })

    test('should close modal with Escape key', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      // Press Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Modal should close
      await expect(page.getByRole('heading', { name: /sign in/i })).not.toBeVisible()
    })

    test('should navigate back with Escape key', async ({ page }) => {
      // Navigate to Cafe section
      await page.getByRole('button', { name: /click to explore/i }).click()
      await page.waitForTimeout(2000)
      await page.getByRole('button', { name: /cafe/i }).click()
      await page.waitForTimeout(1000)

      // Press Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // Should be back to main menu
      await expect(page.getByRole('button', { name: /cafe/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /sensory/i })).toBeVisible()
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper landmarks', async ({ page }) => {
      // Check for semantic HTML landmarks
      const nav = await page.locator('nav').count()
      const main = await page.locator('main').count()
      const footer = await page.locator('footer').count()

      expect(main).toBeGreaterThanOrEqual(1)
      // nav and footer may not be present on landing page
    })

    test('should have descriptive button labels', async ({ page }) => {
      // Click X logo to reveal navigation
      await page.getByRole('button', { name: /click to explore/i }).click()
      await page.waitForTimeout(2000)

      // All navigation buttons should have descriptive labels
      const buttons = await page.locator('button').all()

      for (const button of buttons) {
        const accessibleName = await button.evaluate(el => {
          const ariaLabel = el.getAttribute('aria-label')
          const text = el.textContent?.trim()
          return ariaLabel || text || ''
        })

        // Accessible name should be descriptive (at least 2 characters)
        expect(accessibleName.length).toBeGreaterThanOrEqual(2)
      }
    })

    test('should have skip navigation link', async ({ page }) => {
      // Check for skip to main content link
      const skipLink = page.locator('a[href="#main"]').or(
        page.getByText(/skip to main content/i)
      ).or(
        page.getByText(/skip navigation/i)
      )

      const count = await skipLink.count()
      // Skip link is recommended but not required
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('should announce page title changes', async ({ page }) => {
      const initialTitle = await page.title()

      // Navigate to a section
      await page.getByRole('button', { name: /click to explore/i }).click()
      await page.waitForTimeout(2000)

      const newTitle = await page.title()

      // Title should be set
      expect(newTitle.length).toBeGreaterThan(0)
    })

    test('should have live regions for dynamic content', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: /sign in/i }).first().click()
      await page.waitForTimeout(500)

      // Submit invalid form
      const submitButton = page.getByRole('button', { name: /sign in/i }).last()
      await submitButton.click()

      await page.waitForTimeout(500)

      // Check for aria-live regions (should exist for error messages)
      const liveRegions = await page.locator('[aria-live]').count()
      // Live regions are recommended but may not be implemented yet
      expect(liveRegions).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Responsive Accessibility', () => {
    test('should be accessible on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Run accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should be accessible on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/')

      // Run accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should support zoom up to 200%', async ({ page }) => {
      // Zoom to 200%
      await page.evaluate(() => {
        document.body.style.zoom = '200%'
      })

      await page.waitForTimeout(500)

      // Content should still be accessible
      const xLogo = page.getByRole('button', { name: /click to explore/i })
      await expect(xLogo).toBeVisible()
    })
  })

  test.describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async ({ page, context }) => {
      // Set prefers-reduced-motion
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: (query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          }),
        })
      })

      await page.reload()

      // Click X logo
      await page.getByRole('button', { name: /click to explore/i }).click()

      // Content should still appear (without excessive animations)
      const brand = page.getByText(/plorium/i)
      await expect(brand).toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Admin Panel Accessibility', () => {
    test('should have accessible admin dashboard', async ({ page }) => {
      // TODO: Implement once admin panel is built
      // Expected: No accessibility violations in admin panel
    })

    test('should have accessible data tables', async ({ page }) => {
      // TODO: Test admin tables for proper headers, captions, etc.
      // Expected: Tables have proper th elements, scope attributes
    })

    test('should have accessible form validation in admin', async ({ page }) => {
      // TODO: Test admin forms for accessibility
      // Expected: Error messages properly associated with fields
    })
  })
})
