import { PrismaClient } from '@prisma/client'
import { checkBookingConflict } from '../lib/scheduling.js'

const prisma = new PrismaClient()

async function testConflictDetection() {
  console.log('🧪 Testing Conflict Detection...\n')

  try {
    // Get the two bookings on Dec 4, 2025
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: new Date('2025-12-04T00:00:00'),
          lte: new Date('2025-12-04T23:59:59')
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`Found ${bookings.length} booking(s) on Dec 4, 2025:\n`)

    bookings.forEach((booking, i) => {
      console.log(`Booking ${i + 1}:`)
      console.log(`  ID: ${booking.id}`)
      console.log(`  Date field: ${booking.date}`)
      console.log(`  Time field: "${booking.time}"`)
      console.log(`  Duration: ${booking.duration || 120} minutes`)
      console.log(`  Created: ${booking.createdAt}`)
      console.log('')
    })

    // Now test conflict detection
    console.log('--- Testing Conflict Detection ---\n')

    // Try to create a new booking at the same time
    const testDate = new Date('2025-12-04T09:00:00')
    const duration = 120

    // Format existing bookings
    const existingBookings = bookings.map(b => ({
      id: b.id,
      date: new Date(b.date),
      duration: b.duration || 120
    }))

    console.log('Formatted bookings for conflict check:')
    existingBookings.forEach((b, i) => {
      console.log(`  ${i + 1}. Date: ${b.date.toISOString()}, Duration: ${b.duration}min`)
    })
    console.log('')

    // Check for conflicts
    const conflict = checkBookingConflict(
      testDate,
      duration,
      existingBookings,
      undefined,
      45 // 45-minute buffer
    )

    console.log('Conflict Detection Result:')
    console.log(`  Has Conflict: ${conflict.hasConflict}`)
    if (conflict.hasConflict) {
      console.log(`  Conflict Type: ${conflict.conflictType}`)
      console.log(`  Message: ${conflict.message}`)
      console.log(`  Conflicting Booking ID: ${conflict.conflictingBookingId}`)
    } else {
      console.log('  ❌ NO CONFLICT DETECTED - This is the problem!')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConflictDetection()
