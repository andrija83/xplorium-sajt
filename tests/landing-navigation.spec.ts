import { test, expect } from '@playwright/test'

/**
 * Landing Page Navigation Tests
 *
 * Tests the main navigation flow through the Xplorium landing page:
 * - X logo animation
 * - Brand reveal
 * - Section navigation (Cafe, Sensory, Igraonica)
 * - Subsection navigation
 * - Back navigation with Escape key
 */

test.describe('Landing Page Navigation', () => {
  const revealBrand = async (page: import('@playwright/test').Page) => {
    const xLogo = page.getByRole('button', { name: /click to explore/i })
    await expect(xLogo).toBeVisible()
    await xLogo.click()
    await expect(page.getByText(/plorium/i)).toBeVisible({ timeout: 3000 })
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display X logo on initial load', async ({ page }) => {
    // X logo should be visible
    const xLogo = page.getByRole('button', { name: /click to explore/i })
    await expect(xLogo).toBeVisible()

    // Brand should not be visible yet
    const brand = page.getByText(/plorium/i)
    await expect(brand).not.toBeVisible()
  })

  test('should reveal brand after clicking X logo', async ({ page }) => {
    await revealBrand(page)

    // Three main navigation buttons should appear
    await expect(page.getByRole('button', { name: /cafe/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sensory/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /igraonica/i })).toBeVisible()
  })

  test('should navigate to Cafe section and show submenu', async ({ page }) => {
    await revealBrand(page)

    // Click Cafe button
    await page.getByRole('button', { name: /cafe/i }).click()

    // Cafe submenu items should be visible
    await expect(page.getByRole('button', { name: /meni/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /radno vreme/i })).toBeVisible()
  })

  test('should navigate to Sensory section and show planet orbs', async ({ page }) => {
    await revealBrand(page)

    // Click Sensory button
    await page.getByRole('button', { name: /sensory/i }).click()

    // Planet orbs should be visible
    await expect(page.getByRole('button', { name: /floor/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /wall/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /ceiling/i })).toBeVisible()
  })

  test('should navigate to Igraonica section', async ({ page }) => {
    await revealBrand(page)

    // Click Igraonica button
    await page.getByRole('button', { name: /igraonica/i }).click()

    // Igraonica content should be visible
    const content = page.locator('text=igraonica')
    await expect(content.first()).toBeVisible()
  })

  test('should go back to main menu with Escape key', async ({ page }) => {
    // Navigate to Cafe section
    await revealBrand(page)
    await page.getByRole('button', { name: /cafe/i }).click()

    // Cafe submenu should be visible
    await expect(page.getByRole('button', { name: /meni/i })).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Should be back to main menu
    await expect(page.getByRole('button', { name: /cafe/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sensory/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /igraonica/i })).toBeVisible()

    // Cafe submenu should not be visible
    await expect(page.getByRole('button', { name: /meni/i })).not.toBeVisible()
  })

  test('should navigate through cafe subsection', async ({ page }) => {
    // Navigate to Cafe section
    await revealBrand(page)
    await page.getByRole('button', { name: /cafe/i }).click()

    // Click on a cafe submenu item
    await page.getByRole('button', { name: /meni/i }).click()
    await page.waitForTimeout(500)

    // Menu content should be visible
    const menuContent = page.getByText(/meni/i)
    await expect(menuContent.first()).toBeVisible()

    // Press Escape to go back to cafe submenu
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Should be back to cafe submenu
    await expect(page.getByRole('button', { name: /meni/i })).toBeVisible()
  })

  test('should navigate through sensory subsections', async ({ page }) => {
    // Navigate to Sensory section
    await revealBrand(page)
    await page.getByRole('button', { name: /sensory/i }).click()

    // Click Floor planet
    await page.getByRole('button', { name: /floor/i }).click()
    await page.waitForTimeout(500)

    // Floor content should be visible
    const floorContent = page.getByText(/floor/i)
    await expect(floorContent.first()).toBeVisible()

    // Press Escape to go back to planets
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Should be back to planet orbs
    await expect(page.getByRole('button', { name: /floor/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /wall/i })).toBeVisible()
  })

  test('should show auth buttons in top-right corner', async ({ page }) => {
    // Auth buttons should appear only after brand reveal
    await expect(page.getByRole('button', { name: /sign in/i }).first()).not.toBeVisible()
    await revealBrand(page)
    const signInButton = page.getByRole('button', { name: /sign in/i }).first()
    const signUpButton = page.getByRole('button', { name: /sign up/i }).first()

    await expect(signInButton).toBeVisible()
    await expect(signUpButton).toBeVisible()
  })

  test('back button appears in sections and hides after returning', async ({ page }) => {
    await revealBrand(page)
    await page.getByRole('button', { name: /cafe/i }).click()
    const backButton = page.getByRole('button', { name: /back/i })
    await expect(backButton).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(backButton).not.toBeVisible()
  })

  test('skip to main content is keyboard focusable', async ({ page }) => {
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: /skip to main content/i })
    await expect(skipLink).toBeFocused()
  })

  test('keyboard can open Café via Enter', async ({ page }) => {
    await revealBrand(page)
    const cafe = page.getByRole('button', { name: /cafe/i })
    await cafe.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: /meni/i })).toBeVisible()
  })

  test('should have starfield background', async ({ page }) => {
    // Starfield should be present
    const starfield = page.locator('.fixed.inset-0.overflow-hidden')
    await expect(starfield.first()).toBeVisible()
  })

  test('should support keyboard navigation with Enter key', async ({ page }) => {
    // Focus X logo and press Enter
    const xLogo = page.getByRole('button', { name: /click to explore/i })
    await xLogo.focus()
    await page.keyboard.press('Enter')

    // Brand should appear
    const brand = page.getByText(/plorium/i)
    await expect(brand).toBeVisible({ timeout: 3000 })
  })

  test('should not have hydration errors', async ({ page }) => {
    const errors: string[] = []

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('hydration')) {
        errors.push(msg.text())
      }
    })

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check for hydration errors
    expect(errors).toHaveLength(0)
  })

  test('should respect reduced motion preference', async ({ page, context }) => {
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

    // Reload page
    await page.reload()

    // Click X logo
    await page.getByRole('button', { name: /click to explore/i }).click()

    // Brand should still appear (without animations)
    const brand = page.getByText(/plorium/i)
    await expect(brand).toBeVisible({ timeout: 3000 })
  })
})
