import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mock logger since we're running outside Next.js
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  serverActionError: (action, error) => console.error('[SERVER ACTION ERROR]', action, error)
}

// Copy of notifyAllAdmins function
async function notifyAllAdmins({ type, title, message, data }) {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: { id: true, email: true }
    })

    logger.info(`Found ${admins.length} admins to notify`, { adminEmails: admins.map(a => a.email) })

    if (admins.length === 0) {
      logger.warn('No admins found to notify')
      return {
        success: false,
        error: 'No admins found'
      }
    }

    // Create notification for each admin
    const notifications = await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type,
            title,
            message,
            data: data ? JSON.parse(JSON.stringify(data)) : {}
          }
        })
      )
    )

    logger.info(`Successfully created ${notifications.length} notifications for admins`, { type, title })

    return {
      success: true,
      count: notifications.length
    }
  } catch (error) {
    logger.serverActionError('notifyAllAdmins', error)
    return {
      success: false,
      error: 'Failed to notify admins'
    }
  }
}

async function test() {
  try {
    console.log('Testing notifyAllAdmins function...\n')

    const result = await notifyAllAdmins({
      type: 'NEW_BOOKING',
      title: 'Test Booking via Function',
      message: 'Testing the notifyAllAdmins function',
      data: { bookingId: 'test-456', test: true }
    })

    console.log('\nResult:', result)

    // Check database
    const count = await prisma.notification.count()
    console.log(`\nTotal notifications in DB: ${count}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
