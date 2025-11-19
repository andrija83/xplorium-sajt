import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Test database connection endpoint
 * GET /api/test-db
 *
 * Tests if Vercel can connect to the database and query data
 * Updated to trigger redeploy after adding DATABASE_URL
 */
export async function GET() {
  try {
    console.log('[TEST-DB] Testing database connection...')

    // Test 1: Simple query to check connection
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    console.log('[TEST-DB] Database connected! Current time:', result)

    // Test 2: Count users
    const userCount = await prisma.user.count()
    console.log('[TEST-DB] Total users in database:', userCount)

    // Test 3: Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@xplorium.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })
    console.log('[TEST-DB] Admin user found:', adminUser)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        currentTime: result,
        userCount,
        adminExists: !!adminUser,
        adminUser: adminUser || null,
      }
    })
  } catch (error) {
    console.error('[TEST-DB] Database connection failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : null,
    }, { status: 500 })
  }
}
