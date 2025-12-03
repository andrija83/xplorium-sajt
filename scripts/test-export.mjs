import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testExport() {
  try {
    console.log('Testing export functionality...\n');

    // Test 1: Fetch bookings
    console.log('1. Fetching bookings...');
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      take: 5,
    });
    console.log(`   ✓ Found ${bookings.length} bookings`);
    if (bookings.length > 0) {
      console.log(`   First booking: ${bookings[0].id} on ${bookings[0].date.toISOString().split('T')[0]}`);
    }

    // Test 2: Fetch events
    console.log('\n2. Fetching events...');
    const events = await prisma.event.findMany({
      take: 5,
    });
    console.log(`   ✓ Found ${events.length} events`);
    if (events.length > 0) {
      console.log(`   First event: ${events[0].title}`);
    }

    // Test 3: Fetch users
    console.log('\n3. Fetching users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 5,
    });
    console.log(`   ✓ Found ${users.length} users`);
    if (users.length > 0) {
      console.log(`   First user: ${users[0].email} (${users[0].role})`);
    }

    // Test 4: Check campaigns
    console.log('\n4. Fetching campaigns...');
    const campaigns = await prisma.campaign.findMany({
      take: 5,
    });
    console.log(`   ✓ Found ${campaigns.length} campaigns`);

    // Test 5: Check notifications
    console.log('\n5. Fetching notifications...');
    const notifications = await prisma.notification.findMany({
      take: 5,
    });
    console.log(`   ✓ Found ${notifications.length} notifications`);

    console.log('\n✅ All export data queries successful!');
    console.log('\nData available for export:');
    console.log(`- Bookings: ${bookings.length > 0 ? 'Yes' : 'No data yet'}`);
    console.log(`- Events: ${events.length > 0 ? 'Yes' : 'No data yet'}`);
    console.log(`- Users: ${users.length > 0 ? 'Yes' : 'No data yet'}`);
    console.log(`- Campaigns: ${campaigns.length > 0 ? 'Yes' : 'No data yet'}`);
    console.log(`- Notifications: ${notifications.length > 0 ? 'Yes' : 'No data yet'}`);
  } catch (error) {
    console.error('❌ Error testing export:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testExport();
