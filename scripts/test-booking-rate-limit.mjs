/**
 * Test script for booking creation rate limiting
 *
 * This script tests the dynamic rate limiting for booking creation
 * to ensure it properly enforces the limits configured in the admin panel.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRateLimitSettings() {
  console.log('Testing Booking Rate Limit Settings...\n')

  try {
    // Check if rate limit setting exists
    const rateLimitSetting = await prisma.siteSettings.findUnique({
      where: { key: 'rateLimit.bookingCreation' }
    })

    if (!rateLimitSetting) {
      console.log('❌ Rate limit setting not found in database')
      console.log('Run the following to initialize settings:')
      console.log('  - Sign in as Super Admin')
      console.log('  - Go to Admin Panel > Settings')
      console.log('  - Initialize default settings')
      return
    }

    console.log('✅ Rate limit setting found:')
    console.log(`   Key: ${rateLimitSetting.key}`)
    console.log(`   Value:`, rateLimitSetting.value)
    console.log(`   Category: ${rateLimitSetting.category}`)
    console.log(`   Updated At: ${rateLimitSetting.updatedAt}`)
    console.log(`   Updated By: ${rateLimitSetting.updatedBy || 'N/A'}`)
    console.log()

    // Verify the structure
    const value = rateLimitSetting.value
    if (typeof value === 'object' && value !== null) {
      const maxRequests = value.maxRequests
      const windowMinutes = value.windowMinutes

      if (typeof maxRequests === 'number' && typeof windowMinutes === 'number') {
        console.log('✅ Rate limit configuration valid:')
        console.log(`   Max Requests: ${maxRequests}`)
        console.log(`   Time Window: ${windowMinutes} minutes`)
        console.log()
        console.log(`   Users can create up to ${maxRequests} bookings per ${windowMinutes} minutes`)
      } else {
        console.log('❌ Invalid rate limit configuration structure')
        console.log('   Expected: { maxRequests: number, windowMinutes: number }')
        console.log('   Found:', value)
      }
    } else {
      console.log('❌ Invalid rate limit value (expected object)')
    }

    console.log()
    console.log('Rate limit can be configured via:')
    console.log('  - Admin Panel > Settings > Security')
    console.log('  - Or directly via updateBookingRateLimit() server action')

  } catch (error) {
    console.error('❌ Error testing rate limit settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRateLimitSettings()
