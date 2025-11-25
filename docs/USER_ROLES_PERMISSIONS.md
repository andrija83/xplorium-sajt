# User Roles & Permissions System

**Date:** November 25, 2025
**Status:** ✅ Current Implementation + 🚧 Proposed Enhancements

---

## 📊 Current Role System

### Roles Defined in Database

```prisma
enum Role {
  USER          // Regular customers
  ADMIN         // Admin staff
  SUPER_ADMIN   // Full system access
}
```

---

## 🔐 Current Permissions Matrix

### **USER Role** (Regular Customers)
**Access Level:** Frontend Only

✅ **Can Access:**
- Public website (`/`)
- Sign in/Sign up
- Make bookings (authenticated)
- View their own bookings
- Update their profile
- Manage their own data

❌ **Cannot Access:**
- Admin panel (`/admin/*`)
- Any administrative functions
- Other users' data

---

### **ADMIN Role** (Admin Staff)
**Access Level:** Full Admin Panel Access

✅ **Can Access ALL Admin Pages:**

1. **Dashboard** (`/admin`)
   - View all statistics
   - Recent bookings
   - Recent activity logs
   - Charts and analytics

2. **Bookings** (`/admin/bookings`)
   - View all bookings
   - Approve/Reject bookings
   - Edit booking details
   - Add admin notes
   - Export bookings

3. **Events** (`/admin/events`)
   - Create/Edit/Delete events
   - Publish/Archive events
   - Reorder events
   - Upload event images

4. **Pricing** (`/admin/pricing`)
   - Create/Edit/Delete pricing packages
   - Set popular packages
   - Manage pricing tiers

5. **Maintenance** (`/admin/maintenance`)
   - Create maintenance logs
   - Schedule maintenance
   - Track equipment status

6. **Inventory** (`/admin/inventory`)
   - Manage inventory items
   - Track stock levels
   - Set reorder points

7. **Users** (`/admin/users`)
   - View all users
   - Create new users
   - Edit user roles (except SUPER_ADMIN)
   - Block/Unblock users
   - Delete users (except SUPER_ADMIN)

8. **Customers** (`/admin/customers`)
   - View customer CRM data
   - Manage loyalty points
   - Add/Remove customer tags
   - Edit customer notes
   - Update marketing preferences

9. **Marketing** (`/admin/marketing`)
   - Build customer segments
   - Generate marketing lists
   - Export customer data
   - View marketing statistics

10. **Content** (`/admin/content`)
    - Edit site content
    - Manage content versions
    - Publish content changes

11. **Reports** (`/admin/reports`)
    - Export all data types
    - Generate reports
    - Download CSV files

12. **Audit Logs** (`/admin/audit`)
    - View all audit logs
    - Track system changes

❌ **Cannot Do:**
- Create/Modify SUPER_ADMIN users
- Delete SUPER_ADMIN users
- Change SUPER_ADMIN user roles
- Block SUPER_ADMIN users

---

### **SUPER_ADMIN Role** (System Owner)
**Access Level:** Unrestricted Full Access

✅ **Can Access:**
- Everything ADMIN can access
- Plus additional privileges:
  - Create SUPER_ADMIN users
  - Modify SUPER_ADMIN users
  - Delete any user including other SUPER_ADMINs
  - Change any user's role including SUPER_ADMIN
  - Access to all system settings

❌ **Cannot Do:**
- Delete their own account
- Change their own role
- Block their own account

---

## 🔍 How Permissions Are Enforced

### 1. **Middleware Protection** (`middleware.ts`)
```typescript
// Protects /admin/* routes
if (pathname.startsWith('/admin')) {
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

### 2. **Server Action Authorization**
Every admin action includes:
```typescript
const session = await auth()

if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
  return { error: 'Unauthorized' }
}

// For SUPER_ADMIN only actions:
if (session.user.role !== 'SUPER_ADMIN') {
  return { error: 'Only super admins can perform this action' }
}
```

### 3. **Role-Specific Restrictions**

**User Management:**
- `app/actions/users.ts:139` - Only SUPER_ADMIN can create SUPER_ADMIN users
- `app/actions/users.ts:228` - Only SUPER_ADMIN can assign SUPER_ADMIN role
- `app/actions/users.ts:332` - Only SUPER_ADMIN can block SUPER_ADMIN users
- `app/actions/users.ts:411` - Only SUPER_ADMIN can delete SUPER_ADMIN users

**Self-Protection:**
- `app/actions/users.ts:224` - Cannot change own role
- `app/actions/users.ts:318` - Cannot block own account
- `app/actions/users.ts:396` - Cannot delete own account

---

## 🚧 Proposed Enhancements (From IDEAS Document)

### New Roles to Add:

#### **STAFF Role**
**Purpose:** Limited access for staff members who only handle bookings

✅ **Proposed Permissions:**
- Dashboard (read-only statistics)
- Bookings (approve/reject only, cannot delete)
- Events (view only)
- Cannot access: Users, Customers, Marketing, Content, Reports

#### **MANAGER Role**
**Purpose:** Department managers (e.g., Events Manager, Operations Manager)

✅ **Proposed Permissions:**
- Dashboard (full access)
- Bookings (full access)
- Events (full access)
- Pricing (full access)
- Maintenance (full access)
- Inventory (full access)
- Cannot access: Users, Customers (sensitive data), Marketing, Audit Logs

#### **ACCOUNTANT Role**
**Purpose:** Read-only access for financial reporting

✅ **Proposed Permissions:**
- Dashboard (read-only)
- Bookings (read-only)
- Pricing (read-only)
- Reports (export only)
- Customers (read-only - for revenue tracking)
- Cannot: Modify any data, only view and export

---

## 📋 Proposed Implementation Plan

### Phase 1: Database Schema Updates

```prisma
enum Role {
  USER          // Regular customers
  STAFF         // NEW: Limited staff access
  MANAGER       // NEW: Department manager access
  ACCOUNTANT    // NEW: Read-only financial access
  ADMIN         // Full admin access
  SUPER_ADMIN   // Unrestricted access
}
```

### Phase 2: Permission Helper Functions

Create `lib/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: ['STAFF', 'MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'],

  // Bookings
  VIEW_BOOKINGS: ['STAFF', 'MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'],
  APPROVE_BOOKINGS: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  EDIT_BOOKINGS: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  DELETE_BOOKINGS: ['ADMIN', 'SUPER_ADMIN'],

  // Events
  VIEW_EVENTS: ['STAFF', 'MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'],
  MANAGE_EVENTS: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],

  // Users & Customers
  VIEW_USERS: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_USERS: ['ADMIN', 'SUPER_ADMIN'],
  VIEW_CUSTOMERS: ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'],
  MANAGE_CUSTOMERS: ['ADMIN', 'SUPER_ADMIN'],

  // Marketing
  VIEW_MARKETING: ['ADMIN', 'SUPER_ADMIN'],
  SEND_CAMPAIGNS: ['ADMIN', 'SUPER_ADMIN'],

  // Reports
  VIEW_REPORTS: ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'],
  EXPORT_DATA: ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'],

  // Content
  MANAGE_CONTENT: ['ADMIN', 'SUPER_ADMIN'],

  // System
  VIEW_AUDIT_LOGS: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_ROLES: ['SUPER_ADMIN'],
}

export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS) {
  return PERMISSIONS[permission].includes(userRole)
}
```

### Phase 3: UI Components

Create `components/admin/PermissionGuard.tsx`:

```typescript
export function PermissionGuard({
  permission,
  children,
  fallback = null
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const session = useSession()

  if (!hasPermission(session?.user?.role, permission)) {
    return fallback
  }

  return children
}
```

### Phase 4: Update AdminSidebar

Show/hide menu items based on role:

```typescript
const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ['STAFF', 'MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
    roles: ['STAFF', 'MANAGER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ['ADMIN', 'SUPER_ADMIN']
  },
  // ... etc
]

// Filter based on current user role
const visibleItems = navItems.filter(item =>
  item.roles.includes(session?.user?.role)
)
```

### Phase 5: Page-Level Restrictions

Update each admin page with role checks:

```typescript
// Example: /admin/users/page.tsx
export default async function UsersPage() {
  const session = await auth()

  if (!hasPermission(session?.user?.role, 'VIEW_USERS')) {
    redirect('/admin')
  }

  const canManage = hasPermission(session?.user?.role, 'MANAGE_USERS')

  return (
    // Show read-only or full UI based on permissions
  )
}
```

---

## 🎯 Benefits of Enhanced Role System

### 1. **Security**
- Principle of least privilege
- Reduced risk of accidental data modification
- Clear audit trail of who can do what

### 2. **Scalability**
- Easy to onboard new staff with appropriate access
- Clear delegation of responsibilities
- Supports team growth

### 3. **Compliance**
- GDPR-friendly (limit access to personal data)
- Clear role definitions for audits
- Accountability tracking

### 4. **User Experience**
- Simplified UI for limited roles (less clutter)
- Faster task completion for specific roles
- Reduced training time

---

## 📊 Comparison Table

| Feature | USER | STAFF | MANAGER | ACCOUNTANT | ADMIN | SUPER_ADMIN |
|---------|------|-------|---------|------------|-------|-------------|
| View Dashboard | ❌ | ✅ (limited) | ✅ | ✅ (read-only) | ✅ | ✅ |
| Approve Bookings | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Edit Bookings | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Delete Bookings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Events | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ (limited) | ✅ (full) |
| View Customers | ❌ | ❌ | ❌ | ✅ (read-only) | ✅ | ✅ |
| Manage Customers | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Send Marketing | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Export Reports | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Content | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Roles | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔧 Implementation Checklist

### Current Status (✅ Implemented)
- [x] Basic 3-role system (USER, ADMIN, SUPER_ADMIN)
- [x] Middleware protection for /admin routes
- [x] Server action authorization
- [x] SUPER_ADMIN privilege checks
- [x] Self-protection (cannot delete/block own account)

### Proposed Enhancements (⏳ Not Yet Implemented)
- [ ] Add STAFF, MANAGER, ACCOUNTANT roles to schema
- [ ] Create permission helper functions
- [ ] Build PermissionGuard component
- [ ] Update AdminSidebar with role-based filtering
- [ ] Add page-level permission checks
- [ ] Create read-only views for ACCOUNTANT role
- [ ] Add role badges in user interface
- [ ] Update documentation
- [ ] Run database migration
- [ ] Test all role combinations

---

**Last Updated:** November 25, 2025
**Author:** Claude Code
**Version:** 1.0 - Current State Analysis
