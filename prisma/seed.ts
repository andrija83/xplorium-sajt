import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create initial admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xplorium.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const adminName = process.env.ADMIN_NAME || 'Xplorium Admin'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists. Skipping...')
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

    console.log('✅ Created admin user:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('')
    console.log('⚠️  IMPORTANT: Change the admin password after first login!')
  }

  // Seed initial site content
  console.log('\n🎨 Seeding site content...')

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
      console.log(`✅ Created content for ${section} section`)
    } else {
      console.log(`⚠️  Content for ${section} section already exists. Skipping...`)
    }
  }

  console.log('\n✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
