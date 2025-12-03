'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { formatExportDate, formatExportDateTime } from '@/lib/export-utils';
import { logAudit } from '@/lib/audit';
import { requireAdmin } from '@/lib/auth-utils';

/**
 * Export bookings data
 */
export async function exportBookings(startDate?: string, endDate?: string) {
  try {
    const session = await requireAdmin();
    const user = session.user;

    const whereClause: any = {};

    if (startDate) {
      whereClause.date = { ...whereClause.date, gte: new Date(startDate) };
    }

    if (endDate) {
      whereClause.date = { ...whereClause.date, lte: new Date(endDate) };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const exportData = bookings.map(booking => ({
      ID: booking.id,
      Title: booking.title,
      Date: formatExportDate(booking.date),
      Time: booking.time,
      Type: booking.type,
      'Guest Count': booking.guestCount,
      'Total Amount': booking.totalAmount || 'N/A',
      Currency: booking.currency || 'RSD',
      'Paid Amount': booking.paidAmount || 'N/A',
      'Is Paid': booking.isPaid ? 'Yes' : 'No',
      Status: booking.status,
      'User Name': booking.user?.name || 'N/A',
      'User Email': booking.user?.email || 'N/A',
      'User Phone': booking.user?.phone || 'N/A',
      'Special Requests': booking.specialRequests || 'N/A',
      'Admin Notes': booking.adminNotes || 'N/A',
      'Created At': formatExportDateTime(booking.createdAt),
    }));

    await logAudit({
      userId: user.id,
      action: 'EXPORT',
      entity: 'Booking',
      entityId: 'bulk',
      changes: {
        count: exportData.length,
        startDate,
        endDate,
      },
    });

    logger.info('Bookings exported', { userId: user.id, count: exportData.length });

    return { success: true, data: exportData };
  } catch (error) {
    logger.serverActionError('exportBookings', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export bookings',
    };
  }
}

/**
 * Export events data
 */
export async function exportEvents() {
  try {
    const session = await requireAdmin();
    const user = session.user;

    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' },
    });

    const exportData = events.map(event => ({
      ID: event.id,
      Slug: event.slug,
      Title: event.title,
      Description: event.description || 'N/A',
      Date: formatExportDate(event.date),
      Time: event.time,
      'End Time': event.endTime || 'N/A',
      Category: event.category,
      Status: event.status,
      Capacity: event.capacity || 'N/A',
      'Registered Count': event.registeredCount,
      Price: event.price || 'N/A',
      Currency: event.currency || 'RSD',
      Location: event.location || 'N/A',
      'Is Recurring': event.isRecurring ? 'Yes' : 'No',
      Image: event.image || 'N/A',
      Tags: event.tags.join(', ') || 'N/A',
      'Created At': formatExportDateTime(event.createdAt),
      'Updated At': formatExportDateTime(event.updatedAt),
    }));

    await logAudit({
      userId: user.id,
      action: 'EXPORT',
      entity: 'Event',
      entityId: 'bulk',
      changes: { count: exportData.length },
    });

    logger.info('Events exported', { userId: user.id, count: exportData.length });

    return { success: true, data: exportData };
  } catch (error) {
    logger.serverActionError('exportEvents', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export events',
    };
  }
}

/**
 * Export users data (excluding sensitive information)
 */
export async function exportUsers() {
  try {
    const session = await requireAdmin();
    const user = session.user;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const exportData = users.map(u => ({
      ID: u.id,
      Name: u.name || 'N/A',
      Email: u.email,
      Phone: u.phone || 'N/A',
      Role: u.role,
      'Total Bookings': u._count.bookings,
      'Created At': formatExportDateTime(u.createdAt),
      'Updated At': formatExportDateTime(u.updatedAt),
    }));

    await logAudit({
      userId: user.id,
      action: 'EXPORT',
      entity: 'User',
      entityId: 'bulk',
      changes: { count: exportData.length },
    });

    logger.info('Users exported', { userId: user.id, count: exportData.length });

    return { success: true, data: exportData };
  } catch (error) {
    logger.serverActionError('exportUsers', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export users',
    };
  }
}

/**
 * Export complete backup of all data
 */
export async function exportBackup() {
  try {
    const session = await requireAdmin();
    const user = session.user;

    const [bookings, events, users, notifications, auditLogs, campaigns, siteContent] = await Promise.all([
      prisma.booking.findMany({ include: { user: { select: { email: true, name: true } } } }),
      prisma.event.findMany(),
      prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true } }),
      prisma.notification.findMany(),
      prisma.auditLog.findMany({ take: 1000, orderBy: { createdAt: 'desc' } }),
      prisma.campaign.findMany(),
      prisma.siteContent.findMany(),
    ]);

    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        bookings,
        events,
        users,
        notifications,
        auditLogs,
        campaigns,
        siteContent,
      },
      counts: {
        bookings: bookings.length,
        events: events.length,
        users: users.length,
        notifications: notifications.length,
        auditLogs: auditLogs.length,
        campaigns: campaigns.length,
        siteContent: siteContent.length,
      },
    };

    await logAudit({
      userId: user.id,
      action: 'EXPORT',
      entity: 'System',
      entityId: 'full-backup',
      changes: backup.counts,
    });

    logger.info('Full backup exported', { userId: user.id, counts: backup.counts });

    return { success: true, data: backup };
  } catch (error) {
    logger.serverActionError('exportBackup', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export backup',
    };
  }
}
