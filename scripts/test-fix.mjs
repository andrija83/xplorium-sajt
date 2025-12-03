import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay } from 'date-fns'

const prisma = new PrismaClient()

// Simplified conflict check logic (matching the fix)
function checkOverlap(start1, end1, start2, end2) {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  )
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}

function subMinutes(date, minutes) {
  return new Date(date.getTime() - minutes * 60000)
}

async function testFix() {
  console.log('🧪 Testing Conflict Detection Fix...\n')

  // Simulate what the fixed code does
  const testDate = new Date('2025-12-04')
  const testTime = '09:00'
  const dayStart = startOfDay(testDate)
  const dayEnd = endOfDay(testDate)

  console.log('Query Range:')
  console.log(`  From: ${dayStart.toISOString()}`)
  console.log(`  To:   ${dayEnd.toISOString()}\n`)

  // Get existing bookings
  const existingBookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: dayStart,
        lte: dayEnd
      },
      status: {
        in: ['PENDING', 'APPROVED', 'COMPLETED']
      }
    },
    select: {
      id: true,
      date: true,
      time: true,
      title: true
    }
  })

  console.log(`Found ${existingBookings.length} existing booking(s)\n`)

  // Format bookings (matching the fix)
  const formattedBookings = existingBookings.map(b => {
    const bookingDateTime = new Date(b.date)
    const [hours, minutes] = b.time.split(':').map(Number)
    bookingDateTime.setHours(hours, minutes, 0, 0)

    console.log(`Existing: ${b.title}`)
    console.log(`  Date field: ${new Date(b.date).toISOString()}`)
    console.log(`  Time field: "${b.time}"`)
    console.log(`  Combined DateTime: ${bookingDateTime.toISOString()}`)
    console.log(`  Duration: 120min (default)\n`)

    return {
      id: b.id,
      date: bookingDateTime,
      duration: 120
    }
  })

  // New booking attempt
  const [newHours, newMinutes] = testTime.split(':').map(Number)
  const newBookingStart = new Date(testDate)
  newBookingStart.setHours(newHours, newMinutes, 0, 0)
  const newBookingEnd = addMinutes(newBookingStart, 120)

  console.log('New Booking Attempt:')
  console.log(`  Start: ${newBookingStart.toISOString()}`)
  console.log(`  End:   ${newBookingEnd.toISOString()}`)
  console.log(`  Duration: 120min\n`)

  // Check for conflicts (with 45min buffer)
  const bufferMinutes = 45
  const bufferStart = subMinutes(newBookingStart, bufferMinutes)
  const bufferEnd = addMinutes(newBookingEnd, bufferMinutes)

  console.log('Buffer Window:')
  console.log(`  Start: ${bufferStart.toISOString()} (${bufferMinutes}min before)`)
  console.log(`  End:   ${bufferEnd.toISOString()} (${bufferMinutes}min after)\n`)

  let hasConflict = false
  let conflictType = null

  for (const existing of formattedBookings) {
    const existingStart = existing.date
    const existingEnd = addMinutes(existingStart, existing.duration)

    console.log(`Checking against: ${existing.id}`)
    console.log(`  Existing: ${existingStart.toISOString()} → ${existingEnd.toISOString()}`)

    // Check direct overlap
    const directOverlap = checkOverlap(
      newBookingStart,
      newBookingEnd,
      existingStart,
      existingEnd
    )

    if (directOverlap) {
      console.log(`  ❌ DIRECT OVERLAP DETECTED!`)
      hasConflict = true
      conflictType = 'double_booking'
      break
    }

    // Check buffer violation
    const bufferViolation = checkOverlap(
      bufferStart,
      bufferEnd,
      existingStart,
      existingEnd
    )

    if (bufferViolation) {
      console.log(`  ⚠️  BUFFER VIOLATION DETECTED!`)
      hasConflict = true
      conflictType = 'buffer_violation'
      break
    }

    console.log(`  ✓ No conflict with this booking\n`)
  }

  console.log('\n=== RESULT ===')
  if (hasConflict) {
    console.log(`✅ Conflict detected: ${conflictType}`)
    console.log('The fix is working correctly!')
  } else {
    console.log('❌ No conflict detected - still broken!')
  }

  await prisma.$disconnect()
}

testFix().catch(console.error)
