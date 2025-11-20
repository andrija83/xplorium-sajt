# Security Implementation Guide

## Overview

This document outlines the comprehensive security implementation for the Xplorium application, focusing on server-side authorization and role-based access control (RBAC).

---

## Security Architecture

### Role-Based Access Control (RBAC)

The application implements a three-tier role system:

1. **USER** - Standard authenticated users
   - Can create bookings
   - Can view their own bookings
   - Limited to user-specific operations

2. **ADMIN** - Administrative users
   - Full CRUD access to all resources
   - Can manage users, bookings, events, inventory, pricing, and content
   - Cannot delete super admins or modify other admins' roles

3. **SUPER_ADMIN** - System administrators
   - All ADMIN permissions
   - Can manage other admins
   - Can perform critical system operations
   - Highest level of access

---

## Authorization Utilities

### Location: `lib/auth-utils.ts`

A centralized library of authorization helper functions that ensure consistent security checks across all server actions.

### Core Functions

#### `requireRole(roles: Role[])`
Generic role checker that throws an error if the user doesn't have one of the specified roles.

```typescript
import { requireRole } from '@/lib/auth-utils'

const session = await requireRole(['ADMIN', 'SUPER_ADMIN'])
// Throws: "Unauthorized: Requires one of roles: ADMIN, SUPER_ADMIN"
```

#### `requireAdmin()`
Convenience function for the most common authorization check.

```typescript
import { requireAdmin } from '@/lib/auth-utils'

const session = await requireAdmin()
// Throws: "Unauthorized: Requires one of roles: ADMIN, SUPER_ADMIN"
```

#### `requireSuperAdmin()`
For critical operations that only super admins should perform.

```typescript
import { requireSuperAdmin } from '@/lib/auth-utils'

const session = await requireSuperAdmin()
// Throws: "Unauthorized: Requires one of roles: SUPER_ADMIN"
```

#### `requireAuth()`
For actions that require login but don't need specific role.

```typescript
import { requireAuth } from '@/lib/auth-utils'

const session = await requireAuth()
// Throws: "Unauthorized: Authentication required"
```

#### `requireOwnerOrAdmin(userId: string)`
User can access if they own the resource OR are an admin.

```typescript
import { requireOwnerOrAdmin } from '@/lib/auth-utils'

const session = await requireOwnerOrAdmin(booking.userId)
// Throws: "Unauthorized: Must be resource owner or admin"
```

### Helper Functions

#### `hasRole(roles: Role[]): Promise<boolean>`
Returns boolean instead of throwing error.

```typescript
const isAdmin = await hasRole(['ADMIN', 'SUPER_ADMIN'])
if (!isAdmin) {
  return { error: 'Insufficient permissions' }
}
```

#### `isAdmin(): Promise<boolean>`
Convenience function that returns boolean.

```typescript
const isAdmin = await isAdmin()
```

#### `getCurrentSession()`
Gets current session or returns null without throwing.

```typescript
const session = await getCurrentSession()
if (!session) return { error: 'Please sign in' }
```

#### `isResourceOwner(userId: string): Promise<boolean>`
Checks if current user is the owner of a resource.

```typescript
if (!await isResourceOwner(booking.userId)) {
  return { error: 'You can only modify your own bookings' }
}
```

---

## Server Actions Security

All server actions follow a consistent security pattern:

### Pattern for Admin-Only Operations

```typescript
'use server'

import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function adminOperation() {
  try {
    // 1. Check authorization FIRST
    const session = await requireAdmin()

    // 2. Perform database operation
    const result = await prisma.something.findMany()

    // 3. Return success
    return { success: true, result }
  } catch (error) {
    // 4. Handle errors gracefully
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}
```

### Pattern for User-Specific Operations

```typescript
'use server'

import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function userOperation() {
  try {
    // 1. Require authentication
    const session = await requireAuth()

    // 2. Perform operation with user's ID
    const result = await prisma.booking.create({
      data: {
        userId: session.user.id,
        // ... other fields
      }
    })

    return { success: true, result }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Authentication required' }
  }
}
```

### Pattern for Public Endpoints

```typescript
'use server'

import { prisma } from '@/lib/db'

export async function publicOperation() {
  try {
    // No auth check needed
    const result = await prisma.event.findMany({
      where: { status: 'PUBLISHED' }
    })

    return { success: true, result }
  } catch (error) {
    return { error: 'Failed to load data' }
  }
}
```

---

## Security Implementation by Module

### ✅ Content Management (`app/actions/content.ts`)

**Authorization:** Admin only

**Functions:**
- `getContentBySection()` - Admin only
- `updateContent()` - Admin only
- `getAllContent()` - Admin only

**Implementation:**
```typescript
import { requireAdmin } from '@/lib/auth-utils'

export async function updateContent(data: UpdateContentInput) {
  try {
    const session = await requireAdmin()
    // ... rest of implementation
  } catch (error) {
    if (error instanceof Error) return { error: error.message }
    return { error: 'Unauthorized' }
  }
}
```

---

### ✅ Pricing Management (`app/actions/pricing.ts`)

**Authorization:**
- Admin for management operations
- Public for published pricing

**Functions:**
- `getPricingPackages()` - **Admin only** ✅
- `getPricingPackageById()` - **Admin only** ✅
- `getPublishedPricingPackages()` - **Public** ✅
- `createPricingPackage()` - **Admin only** ✅
- `updatePricingPackage()` - **Admin only** ✅
- `deletePricingPackage()` - **Admin only** ✅
- `reorderPricingPackages()` - **Admin only** ✅

---

### ✅ Events Management (`app/actions/events.ts`)

**Authorization:**
- Admin for management operations
- Public for published events

**Functions:**
- `getEvents()` - **Admin only** ✅
- `getEventById()` - **Admin only** ✅
- `getEventBySlug()` - **Public** ✅
- `getPublishedEvents()` - **Public** ✅
- `createEvent()` - **Admin only** ✅
- `updateEvent()` - **Admin only** ✅
- `deleteEvent()` - **Admin only** ✅
- `reorderEvents()` - **Admin only** ✅

---

### ✅ Bookings Management (`app/actions/bookings.ts`)

**Authorization:**
- Admin for management
- Authenticated users for own bookings
- Public for viewing approved bookings

**Functions:**
- `getBookings()` - **Admin only** ✅
- `getBookingById()` - **Admin only** ✅
- `createBooking()` - **Authenticated users** ✅
- `updateBooking()` - **Admin only** ✅
- `approveBooking()` - **Admin only** ✅
- `rejectBooking()` - **Admin only** ✅
- `deleteBooking()` - **Admin only** ✅
- `getApprovedBookings()` - **Public** ✅
- `getUserBookings()` - **Authenticated users** ✅

**Special Case:**
`createBooking()` uses `requireAuth()` instead of `requireAdmin()` because regular users need to create bookings.

---

### ✅ Dashboard Statistics (`app/actions/dashboard.ts`)

**Authorization:** Admin only

**Functions:**
- `getDashboardStats()` - **Admin only** ✅
- `getRecentActivity()` - **Admin only** ✅

---

### ✅ Users Management (`app/actions/users.ts`)

**Authorization:** Admin only (already implemented)

**Functions:**
- All user CRUD operations require admin role

---

### ✅ Inventory Management (`app/actions/inventory.ts`)

**Authorization:** Admin only (already implemented)

**Functions:**
- All inventory operations require admin role

---

### ✅ Maintenance Management (`app/actions/maintenance.ts`)

**Authorization:** Admin only (already implemented)

**Functions:**
- All maintenance operations require admin role

---

### ✅ Audit Logs (`app/actions/audit.ts`)

**Authorization:** Admin only (already implemented)

**Functions:**
- All audit log operations require admin role

---

## Security Best Practices

### 1. Always Check Authorization First

```typescript
export async function secureAction() {
  try {
    // ✅ CORRECT: Check auth before any logic
    const session = await requireAdmin()
    const data = await prisma.something.findMany()
    return { success: true, data }
  } catch (error) {
    return { error: error.message }
  }
}
```

```typescript
export async function insecureAction() {
  try {
    // ❌ WRONG: Logic before auth check
    const data = await prisma.something.findMany()
    const session = await requireAdmin()
    return { success: true, data }
  } catch (error) {
    return { error: error.message }
  }
}
```

### 2. Use Specific Role Checks

```typescript
// ✅ CORRECT: Use specific helper
const session = await requireAdmin()

// ❌ WRONG: Manual check (inconsistent)
const session = await auth()
if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
  return { error: 'Unauthorized' }
}
```

### 3. Always Catch Errors

```typescript
// ✅ CORRECT: Proper error handling
try {
  const session = await requireAdmin()
  // ... operation
} catch (error) {
  if (error instanceof Error) {
    return { error: error.message }
  }
  return { error: 'Unauthorized' }
}

// ❌ WRONG: No error handling
const session = await requireAdmin()
// ... operation (throws unhandled error)
```

### 4. Distinguish Public vs Protected Endpoints

```typescript
// Public endpoint - no auth check
export async function getPublishedEvents() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' }
  })
  return { success: true, events }
}

// Protected endpoint - requires auth
export async function getAllEvents() {
  try {
    await requireAdmin()
    const events = await prisma.event.findMany()
    return { success: true, events }
  } catch (error) {
    return { error: error.message }
  }
}
```

### 5. Use Resource Ownership Checks

```typescript
export async function updateUserProfile(userId: string, data: any) {
  try {
    // Allow if user is owner OR admin
    const session = await requireOwnerOrAdmin(userId)

    const user = await prisma.user.update({
      where: { id: userId },
      data
    })

    return { success: true, user }
  } catch (error) {
    return { error: error.message }
  }
}
```

### 6. Log Security Events

Always log security-sensitive actions using the audit system:

```typescript
export async function deleteUser(id: string) {
  try {
    const session = await requireAdmin()

    await prisma.user.delete({ where: { id } })

    // Log the action
    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
    })

    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}
```

---

## Testing Authorization

### Manual Testing Checklist

For each protected endpoint:

- [ ] Test with no authentication (should fail)
- [ ] Test with USER role (should fail if admin-only)
- [ ] Test with ADMIN role (should succeed)
- [ ] Test with SUPER_ADMIN role (should succeed)
- [ ] Test resource ownership checks (if applicable)
- [ ] Verify error messages are informative but not leaking sensitive info
- [ ] Check that audit logs are created for sensitive operations

### Example Test Scenarios

**Scenario 1: Admin-Only Endpoint**
```
Action: Delete event
No auth → "Unauthorized: Not authenticated"
USER role → "Unauthorized: Requires one of roles: ADMIN, SUPER_ADMIN"
ADMIN role → Success
SUPER_ADMIN role → Success
```

**Scenario 2: User-Specific Endpoint**
```
Action: Get user's bookings
No auth → "Unauthorized: Authentication required"
USER role (own bookings) → Success
USER role (other's bookings) → "Unauthorized: Must be resource owner or admin"
ADMIN role (any bookings) → Success
```

**Scenario 3: Public Endpoint**
```
Action: Get published events
No auth → Success
USER role → Success
ADMIN role → Success
```

---

## Migration Summary

### Refactored Files

All action files have been refactored to use `lib/auth-utils.ts`:

1. ✅ `app/actions/content.ts` - Using `requireAdmin()`
2. ✅ `app/actions/pricing.ts` - Using `requireAdmin()` for management, public for published
3. ✅ `app/actions/events.ts` - Using `requireAdmin()` for management, public for published
4. ✅ `app/actions/bookings.ts` - Using `requireAdmin()` and `requireAuth()`
5. ✅ `app/actions/dashboard.ts` - Using `requireAdmin()`

### Before Migration

```typescript
const session = await auth()
if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
  return { error: 'Unauthorized' }
}
```

### After Migration

```typescript
const session = await requireAdmin()
```

**Benefits:**
- Consistent error messages
- Centralized authorization logic
- Easier to audit security
- Reduced code duplication
- Type-safe with TypeScript
- Better maintainability

---

## Security Checklist

### Implementation Status

- ✅ Created centralized auth utilities (`lib/auth-utils.ts`)
- ✅ Refactored all admin operations to use `requireAdmin()`
- ✅ Refactored user operations to use `requireAuth()`
- ✅ Added auth checks to previously unprotected query functions
- ✅ Distinguished public vs protected endpoints
- ✅ Proper error handling for all auth failures
- ✅ Audit logging for sensitive operations
- ✅ Resource ownership checks where needed

### Action Files Status

| File | Status | Notes |
|------|--------|-------|
| `content.ts` | ✅ Secured | All functions require admin |
| `pricing.ts` | ✅ Secured | Admin for management, public for published |
| `events.ts` | ✅ Secured | Admin for management, public for published |
| `bookings.ts` | ✅ Secured | Mixed: admin, authenticated, public |
| `dashboard.ts` | ✅ Secured | All functions require admin |
| `users.ts` | ✅ Secured | Already had proper checks |
| `inventory.ts` | ✅ Secured | Already had proper checks |
| `maintenance.ts` | ✅ Secured | Already had proper checks |
| `audit.ts` | ✅ Secured | Already had proper checks |

---

## Common Patterns Reference

### Admin-Only Query
```typescript
export async function getAdminData() {
  try {
    await requireAdmin()
    const data = await prisma.something.findMany()
    return { success: true, data }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Unauthorized' }
  }
}
```

### Admin-Only Mutation with Audit
```typescript
export async function createResource(data: any) {
  try {
    const session = await requireAdmin()
    const resource = await prisma.resource.create({ data })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Resource',
      entityId: resource.id,
      changes: data,
    })

    revalidatePath('/admin/resources')
    return { success: true, resource }
  } catch (error) {
    return { error: error.message }
  }
}
```

### User-Specific Query
```typescript
export async function getUserData() {
  try {
    const session = await requireAuth()
    const data = await prisma.something.findMany({
      where: { userId: session.user.id }
    })
    return { success: true, data }
  } catch (error) {
    return { error: error.message }
  }
}
```

### Owner or Admin Check
```typescript
export async function updateResource(id: string, data: any) {
  try {
    const resource = await prisma.resource.findUnique({ where: { id } })
    if (!resource) return { error: 'Not found' }

    const session = await requireOwnerOrAdmin(resource.userId)

    const updated = await prisma.resource.update({
      where: { id },
      data
    })

    return { success: true, resource: updated }
  } catch (error) {
    return { error: error.message }
  }
}
```

---

---

## Audit Logging System

### Overview

The application implements comprehensive audit logging for all admin actions, providing a complete audit trail for compliance, security monitoring, and debugging.

### What Gets Logged

All admin mutations are automatically logged with the following information:

1. **User Information**
   - User ID performing the action
   - User name and email
   - User role

2. **Action Details**
   - Action type (CREATE, UPDATE, DELETE, APPROVE, REJECT)
   - Entity type (User, Booking, Event, Content, etc.)
   - Entity ID
   - Timestamp

3. **Change Tracking**
   - Before/after values for updates
   - Complete data for creates
   - Metadata for approvals/rejections

4. **Technical Details** (automatically captured in `lib/audit.ts`)
   - IP address
   - User agent
   - Request metadata

### Logged Operations

#### ✅ User Management
- **CREATE** - New user creation
- **UPDATE** - Role changes with before/after values
- **UPDATE** - User blocking/unblocking
- **DELETE** - User deletion

**Example:**
```typescript
await logAudit({
  userId: session.user.id,
  action: 'UPDATE',
  entity: 'User',
  entityId: userId,
  changes: { role: { from: 'USER', to: 'ADMIN' } }
})
```

#### ✅ Booking Management
- **CREATE** - New booking creation
- **UPDATE** - Booking modifications
- **APPROVE** - Booking approvals with admin notes
- **REJECT** - Booking rejections with reasons
- **DELETE** - Booking deletion

**Example:**
```typescript
await logAudit({
  userId: session.user.id,
  action: 'APPROVE',
  entity: 'Booking',
  entityId: bookingId,
  changes: { status: 'APPROVED', adminNotes: 'Verified payment' }
})
```

#### ✅ Event Management
- **CREATE** - New event creation
- **UPDATE** - Event modifications (including status changes to PUBLISHED)
- **UPDATE** - Event reordering
- **DELETE** - Event deletion

#### ✅ Content Management
- **UPDATE** - Content section updates with full change tracking

**Example:**
```typescript
await logAudit({
  userId: session.user.id,
  action: 'UPDATE',
  entity: 'Content',
  entityId: section,
  changes: newContent
})
```

#### ✅ Pricing Management
- **CREATE** - New pricing package
- **UPDATE** - Price/package updates
- **UPDATE** - Package reordering
- **DELETE** - Package deletion

#### ✅ Inventory Management
- **CREATE** - New inventory items
- **UPDATE** - Item modifications
- **UPDATE** - Stock adjustments
- **DELETE** - Item deletion

#### ✅ Maintenance Logs
- **CREATE** - New maintenance entries
- **UPDATE** - Log updates
- **UPDATE** - Status changes
- **DELETE** - Log deletion

### Audit Log Viewer

**Location:** `/admin/audit`

**Features:**
- ✅ Real-time log display
- ✅ Filter by action type (CREATE, UPDATE, DELETE, APPROVE, REJECT)
- ✅ Filter by entity type (User, Booking, Event, Content, etc.)
- ✅ Pagination for performance
- ✅ **CSV Export** - Download logs for external analysis
- ✅ Detailed change tracking
- ✅ Color-coded actions for quick scanning

**CSV Export:**
- Exports filtered or all logs
- Includes all log details (date, action, entity, user, changes)
- Timestamp included in filename
- Properly escaped CSV format
- Handles large datasets (up to 10,000 records)

**Usage:**
```
1. Navigate to /admin/audit
2. Apply filters (optional)
3. Click "Export to CSV" button
4. Download: audit-logs-YYYY-MM-DD-HHmmss.csv
```

### Audit Implementation Pattern

For all admin mutations:

```typescript
export async function adminMutation(data: any) {
  try {
    const session = await requireAdmin()

    // Perform operation
    const result = await prisma.something.create({ data })

    // Log the action
    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Something',
      entityId: result.id,
      changes: data,
    })

    revalidatePath('/admin/something')
    return { success: true, result }
  } catch (error) {
    return { error: error.message }
  }
}
```

### Audit Log Retention

**Current Implementation:**
- All logs stored indefinitely in database
- No automatic cleanup

**Recommendations for Production:**
1. Implement retention policy (e.g., 90 days, 1 year, or 7 years for compliance)
2. Archive old logs to cold storage
3. Set up automated exports for compliance
4. Monitor audit log table size

**Example Retention Query:**
```sql
-- Archive logs older than 1 year
DELETE FROM "AuditLog"
WHERE "createdAt" < NOW() - INTERVAL '1 year';
```

### Compliance Considerations

The audit logging system supports:

1. **GDPR Compliance**
   - Tracks all user data modifications
   - Records who accessed/modified personal data
   - Provides audit trail for data deletion requests

2. **SOC 2 Compliance**
   - Logs all administrative actions
   - Tracks privileged user activities
   - Immutable audit trail

3. **HIPAA Compliance** (if handling health data)
   - Logs all access to sensitive information
   - Records all modifications
   - Tracks user authentication events

### Security Best Practices

1. **Log Immutability**
   - Audit logs should not be editable
   - Only admins can view logs
   - No deletion of audit logs through UI

2. **Sensitive Data Handling**
   - Never log passwords or tokens
   - Be careful with PII in change logs
   - Consider masking sensitive fields

3. **Monitoring**
   - Regular review of audit logs
   - Alert on suspicious patterns
   - Monitor failed authorization attempts

4. **Backup**
   - Regular backups of audit logs
   - Separate from main database backups
   - Encrypted backups for compliance

### Audit Log Structure

**Database Schema:**
```typescript
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // CREATE, UPDATE, DELETE, APPROVE, REJECT
  entity    String   // User, Booking, Event, Content, etc.
  entityId  String
  changes   Json?    // Detailed change tracking
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}
```

### Future Enhancements

Potential improvements for audit logging:

1. **Advanced Analytics**
   - Dashboard with audit statistics
   - Trend analysis
   - Anomaly detection

2. **Real-Time Alerts**
   - Notify on suspicious activities
   - Alert on bulk deletions
   - Monitor privilege escalations

3. **Enhanced Export**
   - JSON export format
   - Date range selection
   - Custom field selection
   - Scheduled exports

4. **Search Capabilities**
   - Full-text search in changes
   - Advanced query builder
   - Save search filters

5. **Audit Log Integrity**
   - Cryptographic signatures
   - Blockchain-based immutability
   - Tamper detection

---

## Related Documentation

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Phase 5.1 & 5.2
- [CODE_SPLITTING_GUIDE.md](./CODE_SPLITTING_GUIDE.md) - Performance optimization
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Authorization Patterns](https://www.prisma.io/docs/guides/security)

---

## Conclusion

The Xplorium application now has a comprehensive, centralized authorization system that ensures:

1. **Consistent Security** - All protected endpoints use the same authorization checks
2. **Defense in Depth** - Server-side authorization on all mutations and sensitive queries
3. **Proper Error Handling** - Informative error messages without leaking sensitive info
4. **Audit Trail** - All critical operations are logged
5. **Maintainability** - Centralized auth logic is easy to update and audit
6. **Type Safety** - TypeScript ensures correct usage of auth utilities

**Key Achievement:** Zero unprotected admin operations across the entire application.
