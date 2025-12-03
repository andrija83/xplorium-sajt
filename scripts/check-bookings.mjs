import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBookings() {
  try {
    console.log('📅 Checking recent bookings...\n')

    // Get all bookings from today onwards
    const bookings = await prisma.booking.findMany({
      orderBy: {
        date: 'desc'
      },
      take: 20,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (bookings.length === 0) {
      console.log('No bookings found.')
      return
    }

    console.log(`Found ${bookings.length} booking(s):\n`)

    bookings.forEach((booking, index) => {
      const bookingDate = new Date(booking.date)
      const formattedDate = bookingDate.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      const formattedTime = booking.time

      console.log(`${index + 1}. Booking ID: ${booking.id}`)
      console.log(`   Title: ${booking.title}`)
      console.log(`   Type: ${booking.type}`)
      console.log(`   Date: ${formattedDate}`)
      console.log(`   Time: ${formattedTime}`)
      console.log(`   Duration: ${booking.duration || 120} minutes`)
      console.log(`   Status: ${booking.status}`)
      console.log(`   Customer: ${booking.user.name || 'N/A'} (${booking.user.email})`)
      console.log(`   Created: ${booking.createdAt.toLocaleString()}`)
      console.log('')
    })

    // Check for conflicts on the same day
    console.log('🔍 Checking for potential conflicts...\n')

    const groupedByDate = bookings.reduce((acc, booking) => {
      const dateKey = new Date(booking.date).toDateString()
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(booking)
      return acc
    }, {})

    Object.entries(groupedByDate).forEach(([date, dayBookings]) => {
      if (dayBookings.length > 1) {
        console.log(`⚠️  Multiple bookings on ${date}:`)
        dayBookings.forEach(b => {
          console.log(`   - ${b.time} (${b.duration || 120} min) - ${b.type} - ${b.status}`)
        })
        console.log('')
      }
    })

    // Check buffer time setting
    const bufferSetting = await prisma.siteSettings.findUnique({
      where: { key: 'scheduling.bufferTime' }
    })

    if (bufferSetting) {
      console.log(`⚙️  Current Buffer Time: ${bufferSetting.value.minutes} minutes\n`)
    } else {
      console.log('⚠️  Buffer time not configured (using default: 45 minutes)\n')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBookings()
