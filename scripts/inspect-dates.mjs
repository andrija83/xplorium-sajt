import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function inspect() {
  console.log('🔍 Inspecting booking dates...\n')

  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: new Date('2025-12-04T00:00:00'),
        lte: new Date('2025-12-04T23:59:59')
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Found ${bookings.length} booking(s):\n`)

  bookings.forEach((booking, i) => {
    const dateObj = new Date(booking.date)
    console.log(`Booking ${i + 1}:`)
    console.log(`  ID: ${booking.id}`)
    console.log(`  Date field (raw): ${booking.date}`)
    console.log(`  Date field (ISO): ${dateObj.toISOString()}`)
    console.log(`  Date only: ${dateObj.toDateString()}`)
    console.log(`  Time from Date field: ${dateObj.toTimeString().split(' ')[0]}`)
    console.log(`  Time field (string): "${booking.time}"`)
    console.log(`  Duration: ${booking.duration || 120} minutes`)
    console.log('')
  })

  await prisma.$disconnect()
}

inspect().catch(console.error)
