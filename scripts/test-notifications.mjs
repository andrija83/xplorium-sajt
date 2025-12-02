import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testNotifications() {
  try {
    console.log('Checking notifications in database...')

    const notifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    })

    console.log(`\nFound ${notifications.length} notifications:`)
    notifications.forEach(notif => {
      console.log('\n---')
      console.log('ID:', notif.id)
      console.log('Type:', notif.type)
      console.log('Title:', notif.title)
      console.log('Message:', notif.message)
      console.log('Read:', notif.read)
      console.log('User:', notif.user.email, `(${notif.user.role})`)
      console.log('Created:', notif.createdAt)
    })

    // Count unread
    const unreadCount = await prisma.notification.count({
      where: { read: false }
    })
    console.log(`\n\nTotal unread notifications: ${unreadCount}`)

    // Check for admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    })
    console.log(`\nFound ${admins.length} admins:`)
    admins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.role}) - ID: ${admin.id}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNotifications()
