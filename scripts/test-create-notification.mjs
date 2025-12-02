import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCreateNotification() {
  try {
    console.log('Testing notification creation directly...\n')

    // Get admin user
    const admin = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    })

    if (!admin) {
      console.error('No admin user found!')
      return
    }

    console.log('Admin user:', admin.email, admin.id)

    // Try to create a notification directly
    console.log('\nAttempting to create notification...')
    const notification = await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'NEW_BOOKING',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: { test: true, bookingId: 'test-123' }
      }
    })

    console.log('✓ Notification created successfully!')
    console.log('Notification ID:', notification.id)
    console.log('Notification data:', notification)

    // Verify it was created
    const count = await prisma.notification.count()
    console.log(`\nTotal notifications in DB: ${count}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreateNotification()
