import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

// Simple console wrapper for seed scripts (runs outside normal app context)
// Using direct console for visibility during database seeding
const log = {
  info: (msg: string) => console.log(msg),
  warn: (msg: string) => console.log(msg),
  error: (msg: string, err?: unknown) => {
    console.error(msg)
    if (err) console.error(err)
  }
}

async function main() {
  log.info('🌱 Starting database seed...')

  // Create initial admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xplorium.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const adminName = process.env.ADMIN_NAME || 'Xplorium Admin'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    log.warn('⚠️  Admin user already exists. Skipping...')
  } else {
    const hashedPassword = await hashPassword(adminPassword)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'SUPER_ADMIN',
        emailVerified: new Date(),
      },
    })

    log.info('✅ Created admin user:')
    log.info(`   Email: ${admin.email}`)
    log.info(`   Name: ${admin.name}`)
    log.info(`   Role: ${admin.role}`)
    log.info(`   Password: ${adminPassword}`)
    log.info('')
    log.warn('⚠️  IMPORTANT: Change the admin password after first login!')
  }

  // Seed initial site content
  log.info('\n🎨 Seeding site content...')

  const sections = ['cafe', 'sensory', 'igraonica']

  for (const section of sections) {
    const existingContent = await prisma.siteContent.findUnique({
      where: { section },
    })

    if (!existingContent) {
      await prisma.siteContent.create({
        data: {
          section,
          content: {
            title: `${section.charAt(0).toUpperCase() + section.slice(1)} Section`,
            description: `Default description for ${section} section. Update this from the admin panel.`,
            items: [],
          },
        },
      })
      log.info(`✅ Created content for ${section} section`)
    } else {
      log.warn(`⚠️  Content for ${section} section already exists. Skipping...`)
    }
  }

  log.info('\n✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    log.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
