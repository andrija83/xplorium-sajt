import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to generate random date in December 2025
function randomDecemberDate() {
  const day = Math.floor(Math.random() * 31) + 1 // 1-31
  return new Date(2025, 11, day) // Month 11 = December
}

// Helper to generate random time (9 AM - 9 PM)
function randomTime() {
  const hours = Math.floor(Math.random() * 12) + 9 // 9-20 (9am-8pm)
  const minutes = Math.random() < 0.5 ? 0 : 30 // 0 or 30
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// Helper to generate random name
const firstNames = ['Marko', 'Ana', 'Nikola', 'Jelena', 'Stefan', 'Milica', 'Luka', 'Katarina', 'Petar', 'Jovana', 'Milos', 'Teodora', 'Aleksandar', 'Sara', 'Filip', 'Mia', 'Nemanja', 'Sofija', 'Dusan', 'Emilija']
const lastNames = ['Petrović', 'Jovanović', 'Nikolić', 'Popović', 'Đorđević', 'Stojanović', 'Ilić', 'Marković', 'Stanković', 'Pavlović', 'Kovačević', 'Todorović', 'Simić', 'Kostić', 'Milošević']

function randomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const last = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${first} ${last}`
}

function randomEmail(name) {
  return `${name.toLowerCase().replace(' ', '.')}${Math.floor(Math.random() * 1000)}@example.com`
}

function randomPhone() {
  return `+381 6${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`
}

async function main() {
  console.log('🌱 Starting database seeding...\n')

  // 1. CREATE USERS (50)
  console.log('👥 Creating 50 users...')
  const users = []
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@xplorium.com' } })

  for (let i = 0; i < 50; i++) {
    const name = randomName()
    const email = randomEmail(name)
    const hashedPassword = await hash('password123', 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: randomPhone(),
        role: 'USER',
        marketingOptIn: Math.random() > 0.3, // 70% opt-in
        smsOptIn: Math.random() > 0.5, // 50% opt-in
        loyaltyPoints: Math.floor(Math.random() * 500),
        loyaltyTier: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'VIP'][Math.floor(Math.random() * 5)],
        totalBookings: 0,
        totalSpent: 0,
        preferredContactMethod: ['EMAIL', 'PHONE', 'SMS', 'ANY'][Math.floor(Math.random() * 4)],
        tags: [],
        consentGivenAt: new Date(),
        consentVersion: '1.0',
        dataProcessingConsent: true,
        marketingConsentUpdatedAt: new Date()
      }
    })
    users.push(user)

    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Created ${i + 1}/50 users`)
    }
  }
  console.log(`✅ Created ${users.length} users\n`)

  // 2. CREATE BOOKINGS (75)
  console.log('📅 Creating 75 bookings for December...')
  const bookingTypes = ['CAFE', 'SENSORY_ROOM', 'PLAYGROUND', 'PARTY', 'EVENT']
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']
  const childNames = ['Luka', 'Ana', 'Marko', 'Jovana', 'Stefan', 'Milica', 'Nikola', 'Sara', 'Filip', 'Mia']

  const bookings = []
  for (let i = 0; i < 75; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const type = bookingTypes[Math.floor(Math.random() * bookingTypes.length)]
    const date = randomDecemberDate()
    const time = randomTime()
    const guestCount = Math.floor(Math.random() * 15) + 5 // 5-20 guests
    const childName = childNames[Math.floor(Math.random() * childNames.length)]
    const childAge = Math.floor(Math.random() * 12) + 3 // 3-15 years

    // Create scheduled datetime
    const [hours, minutes] = time.split(':').map(Number)
    const scheduledAt = new Date(date)
    scheduledAt.setHours(hours, minutes, 0, 0)

    // Determine status based on date
    let status
    const today = new Date()
    if (date < today) {
      status = Math.random() > 0.1 ? 'COMPLETED' : 'CANCELLED' // 90% completed, 10% cancelled
    } else if (date.getTime() - today.getTime() < 2 * 24 * 60 * 60 * 1000) {
      status = 'APPROVED' // Upcoming bookings in next 2 days
    } else {
      status = ['PENDING', 'APPROVED'][Math.floor(Math.random() * 2)] // Mix of pending/approved for future
    }

    const title = type === 'PARTY'
      ? `Birthday Party - ${childName} (Age ${childAge})`
      : type === 'PLAYGROUND'
        ? `Playroom Booking - ${childName} (Age ${childAge})`
        : type === 'EVENT'
          ? `Event Booking - ${user.name?.split(' ')[0] || 'Guest'}`
          : `${type.replace('_', ' ')} Booking`

    const totalAmount = type === 'PARTY'
      ? Math.floor(Math.random() * 15000) + 10000 // 10,000-25,000 RSD
      : type === 'PLAYGROUND'
        ? Math.floor(Math.random() * 5000) + 2000 // 2,000-7,000 RSD
        : Math.floor(Math.random() * 3000) + 1000 // 1,000-4,000 RSD

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        title,
        date,
        time,
        type,
        guestCount,
        phone: user.phone || randomPhone(),
        email: user.email,
        status,
        scheduledAt,
        totalAmount,
        currency: 'RSD',
        isPaid: status === 'COMPLETED' ? true : Math.random() > 0.5,
        paymentDate: status === 'COMPLETED' ? date : null,
        specialRequests: Math.random() > 0.7
          ? `Parent: ${user.name}\nChild: ${childName} (${childAge} years old)\nSpecial dietary requirements`
          : `Parent: ${user.name}\nChild: ${childName} (${childAge} years old)`,
        adminNotes: status === 'APPROVED' ? 'Booking confirmed and ready' : null
      }
    })
    bookings.push(booking)

    // Update user stats
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalBookings: { increment: 1 },
          totalSpent: { increment: totalAmount },
          lastBookingDate: date,
          firstBookingDate: user.firstBookingDate || date
        }
      })
    }

    if ((i + 1) % 15 === 0) {
      console.log(`  ✓ Created ${i + 1}/75 bookings`)
    }
  }
  console.log(`✅ Created ${bookings.length} bookings\n`)

  // 3. CREATE EVENTS (10)
  console.log('🎉 Creating 10 events for December...')
  const eventCategories = ['WORKSHOP', 'PARTY', 'SPECIAL_EVENT', 'HOLIDAY', 'SEASONAL', 'CLASS']
  const eventTitles = [
    'Winter Wonderland Party',
    'Christmas Craft Workshop',
    'New Year\'s Eve Celebration',
    'Holiday Cookie Decorating',
    'Sensory Play Session',
    'Kids Yoga Class',
    'Science Fun Workshop',
    'Art & Creativity Hour',
    'Music & Movement Class',
    'Holiday Story Time'
  ]

  for (let i = 0; i < 10; i++) {
    const date = randomDecemberDate()
    const time = randomTime()
    const title = eventTitles[i]
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const category = eventCategories[Math.floor(Math.random() * eventCategories.length)]
    const capacity = Math.floor(Math.random() * 20) + 10 // 10-30 capacity
    const registered = Math.floor(Math.random() * capacity * 0.8) // Up to 80% registered

    await prisma.event.create({
      data: {
        slug: `${slug}-${date.getDate()}`,
        title,
        description: `Join us for an exciting ${title}! Perfect for kids and families. Fun activities, snacks included.`,
        date,
        time,
        endTime: `${String(parseInt(time.split(':')[0]) + 2).padStart(2, '0')}:${time.split(':')[1]}`,
        category,
        status: date < new Date() ? 'COMPLETED' : 'PUBLISHED',
        capacity,
        registeredCount: registered,
        price: Math.floor(Math.random() * 1500) + 500, // 500-2000 RSD
        currency: 'RSD',
        location: 'Xplorium Main Hall',
        isRecurring: false,
        tags: ['kids', 'family', 'fun', category.toLowerCase()],
        createdBy: adminUser?.id,
        order: i
      }
    })
  }
  console.log('✅ Created 10 events\n')

  // 4. CREATE INVENTORY ITEMS (30)
  console.log('📦 Creating 30 inventory items...')
  const inventoryItems = [
    // CAFE
    { name: 'Coffee Beans', category: 'CAFE', quantity: 50, unit: 'kg', reorderPoint: 10, supplierName: 'Coffee Deluxe', supplierContact: '+381 11 123 4567' },
    { name: 'Milk', category: 'CAFE', quantity: 100, unit: 'L', reorderPoint: 20, supplierName: 'Dairy Fresh', supplierContact: '+381 11 234 5678' },
    { name: 'Sugar', category: 'CAFE', quantity: 30, unit: 'kg', reorderPoint: 10, supplierName: 'Sweet Supply', supplierContact: '+381 11 345 6789' },
    { name: 'Tea Assortment', category: 'CAFE', quantity: 200, unit: 'bags', reorderPoint: 50, supplierName: 'Tea Time', supplierContact: '+381 11 456 7890' },
    { name: 'Cookies', category: 'CAFE', quantity: 75, unit: 'packs', reorderPoint: 20, supplierName: 'Bakery Express', supplierContact: '+381 11 567 8901' },
    { name: 'Juice Boxes', category: 'CAFE', quantity: 150, unit: 'boxes', reorderPoint: 30, supplierName: 'Fruit Delight', supplierContact: '+381 11 678 9012' },
    { name: 'Disposable Cups', category: 'CAFE', quantity: 500, unit: 'pcs', reorderPoint: 100, supplierName: 'Party Supply Co', supplierContact: '+381 11 789 0123' },
    { name: 'Napkins', category: 'CAFE', quantity: 300, unit: 'packs', reorderPoint: 50, supplierName: 'Paper Products', supplierContact: '+381 11 890 1234' },

    // PLAYGROUND
    { name: 'Ball Pit Balls', category: 'PLAYGROUND', quantity: 5000, unit: 'pcs', reorderPoint: 1000, supplierName: 'Play Equipment Ltd', supplierContact: '+381 11 901 2345' },
    { name: 'Foam Mats', category: 'PLAYGROUND', quantity: 50, unit: 'pcs', reorderPoint: 10, supplierName: 'Safety First', supplierContact: '+381 11 012 3456' },
    { name: 'Toy Building Blocks', category: 'PLAYGROUND', quantity: 200, unit: 'sets', reorderPoint: 30, supplierName: 'Toy Warehouse', supplierContact: '+381 11 123 4567' },
    { name: 'Slide Wax', category: 'PLAYGROUND', quantity: 10, unit: 'bottles', reorderPoint: 3, supplierName: 'Maintenance Supply', supplierContact: '+381 11 234 5678' },
    { name: 'Safety Padding', category: 'PLAYGROUND', quantity: 100, unit: 'm', reorderPoint: 20, supplierName: 'Safety First', supplierContact: '+381 11 012 3456' },

    // SENSORY_ROOM
    { name: 'LED Light Strips', category: 'SENSORY_ROOM', quantity: 20, unit: 'pcs', reorderPoint: 5, supplierName: 'Light Tech', supplierContact: '+381 11 345 6789' },
    { name: 'Bubble Machine Fluid', category: 'SENSORY_ROOM', quantity: 15, unit: 'L', reorderPoint: 5, supplierName: 'Party Magic', supplierContact: '+381 11 456 7890' },
    { name: 'Sensory Toys', category: 'SENSORY_ROOM', quantity: 50, unit: 'sets', reorderPoint: 10, supplierName: 'Sensory Play Co', supplierContact: '+381 11 567 8901' },
    { name: 'Aromatherapy Oils', category: 'SENSORY_ROOM', quantity: 25, unit: 'bottles', reorderPoint: 5, supplierName: 'Wellness Shop', supplierContact: '+381 11 678 9012' },
    { name: 'Sound Machine Batteries', category: 'SENSORY_ROOM', quantity: 40, unit: 'pcs', reorderPoint: 10, supplierName: 'Electronics Plus', supplierContact: '+381 11 789 0123' },

    // PARTY_SUPPLIES
    { name: 'Birthday Candles', category: 'PARTY_SUPPLIES', quantity: 100, unit: 'packs', reorderPoint: 20, supplierName: 'Party Supply Co', supplierContact: '+381 11 789 0123' },
    { name: 'Balloons', category: 'PARTY_SUPPLIES', quantity: 500, unit: 'pcs', reorderPoint: 100, supplierName: 'Party Supply Co', supplierContact: '+381 11 789 0123' },
    { name: 'Party Hats', category: 'PARTY_SUPPLIES', quantity: 200, unit: 'pcs', reorderPoint: 40, supplierName: 'Party Supply Co', supplierContact: '+381 11 789 0123' },
    { name: 'Streamers', category: 'PARTY_SUPPLIES', quantity: 80, unit: 'rolls', reorderPoint: 15, supplierName: 'Party Supply Co', supplierContact: '+381 11 789 0123' },
    { name: 'Goodie Bags', category: 'PARTY_SUPPLIES', quantity: 150, unit: 'pcs', reorderPoint: 30, supplierName: 'Party Supply Co', supplierContact: '+381 11 789 0123' },
    { name: 'Confetti', category: 'PARTY_SUPPLIES', quantity: 50, unit: 'packs', reorderPoint: 10, supplierName: 'Party Supply Co', supplierContact: '+381 11 789 0123' },

    // CLEANING
    { name: 'Disinfectant Spray', category: 'CLEANING', quantity: 20, unit: 'bottles', reorderPoint: 5, supplierName: 'Clean Pro', supplierContact: '+381 11 890 1234' },
    { name: 'Floor Cleaner', category: 'CLEANING', quantity: 30, unit: 'L', reorderPoint: 10, supplierName: 'Clean Pro', supplierContact: '+381 11 890 1234' },
    { name: 'Microfiber Cloths', category: 'CLEANING', quantity: 100, unit: 'pcs', reorderPoint: 20, supplierName: 'Clean Pro', supplierContact: '+381 11 890 1234' },
    { name: 'Trash Bags', category: 'CLEANING', quantity: 200, unit: 'rolls', reorderPoint: 40, supplierName: 'Clean Pro', supplierContact: '+381 11 890 1234' },
    { name: 'Hand Sanitizer', category: 'CLEANING', quantity: 50, unit: 'bottles', reorderPoint: 10, supplierName: 'Clean Pro', supplierContact: '+381 11 890 1234' },

    // GENERAL
    { name: 'Printer Paper', category: 'GENERAL', quantity: 20, unit: 'reams', reorderPoint: 5, supplierName: 'Office Depot', supplierContact: '+381 11 901 2345' }
  ]

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        ...item,
        lastRestocked: new Date(2025, 10, Math.floor(Math.random() * 30) + 1) // Random date in November
      }
    })
  }
  console.log(`✅ Created ${inventoryItems.length} inventory items\n`)

  // 5. SUMMARY
  console.log('📊 Seeding Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`👥 Users: ${users.length}`)
  console.log(`📅 Bookings: ${bookings.length} (December 2025)`)
  console.log(`🎉 Events: 10`)
  console.log(`📦 Inventory Items: ${inventoryItems.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const statusCount = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  console.log('\n📅 Booking Status Breakdown:')
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`)
  })

  console.log('\n✨ Test data seeding completed successfully!')
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
