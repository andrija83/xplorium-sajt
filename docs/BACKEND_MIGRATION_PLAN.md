# Backend Migration & Implementation Plan

## Executive Summary

This document provides a detailed migration strategy for implementing the Xplorium admin panel backend. The plan modernizes the original TODO list with Next.js 16 best practices, emphasizing Server Actions over traditional API routes and leveraging native Next.js features.

---

## Architecture Overview

### Core Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Database** | PostgreSQL (Vercel Postgres) | Production-ready, excellent Vercel integration, robust ACID compliance |
| **ORM** | Prisma | Type-safe, excellent DX, auto-generated types |
| **Authentication** | NextAuth.js v5 (Auth.js) | Industry standard, built for Next.js, supports middleware |
| **Email Service** | Resend | Modern API, excellent deliverability, Next.js optimized |
| **File Storage** | Vercel Blob | Seamless Vercel integration, CDN-backed, simple API |
| **Validation** | Zod | Already in package.json, type-safe, composable |
| **Data Mutations** | Server Actions | Next.js 16 native, type-safe, less boilerplate |
| **Charts** | Recharts | Already in package.json, lightweight, accessible |

### Key Architectural Decisions

#### 1. **Server Actions > API Routes**

**Use Server Actions for:**
- All CRUD operations (events, bookings, users, content)
- Form submissions
- Data mutations
- Better type safety with direct TypeScript inference

**Reserve API Routes for:**
- NextAuth callbacks (`/api/auth/[...nextauth]`)
- Webhooks (file uploads, payment callbacks)
- Third-party integrations
- Rate-limited public endpoints

**Benefits:**
- ✅ Automatic POST endpoint creation
- ✅ Direct database access without HTTP overhead
- ✅ Better TypeScript inference
- ✅ Built-in security (CSRF protection)
- ✅ Progressive enhancement support

#### 2. **Hybrid Data Fetching Strategy**

```
Server Components (Default)
    ↓
Direct Prisma Queries (for reads)
    ↓
Server Actions (for mutations)
    ↓
Optimistic Updates (client-side)
```

#### 3. **Middleware-First Security**

```typescript
// middleware.ts handles all route protection
Request → Middleware → Auth Check → Role Check → Page/Action
```

---

## Database Schema Design

### Enhanced Schema (from original TODO)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  password      String    // bcrypt hashed
  role          Role      @default(USER)
  image         String?
  blocked       Boolean   @default(false)

  // Relations
  bookings      Booking[]
  auditLogs     AuditLog[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([role])
}

// ============================================
// BOOKINGS
// ============================================

model Booking {
  id          String        @id @default(cuid())

  // User relationship (optional - allow guest bookings)
  userId      String?
  user        User?         @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Booking details
  title       String
  date        DateTime
  time        String
  type        BookingType
  guestCount  Int

  // Contact info (required even for logged-in users)
  phone       String
  email       String

  // Status & notes
  status      BookingStatus @default(PENDING)
  adminNotes  String?       @db.Text

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([status])
  @@index([date])
  @@index([email])
  @@index([userId])
}

// ============================================
// EVENTS
// ============================================

model Event {
  id          String      @id @default(cuid())
  slug        String      @unique
  title       String
  description String      @db.Text

  // Schedule
  date        DateTime
  time        String

  // Media & categorization
  image       String?
  category    String

  // Publishing
  status      EventStatus @default(DRAFT)
  order       Int         @default(0) // For drag-and-drop reordering

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([status])
  @@index([date])
  @@index([slug])
}

// ============================================
// CONTENT MANAGEMENT
// ============================================

model SiteContent {
  id        String   @id @default(cuid())
  section   String   @unique // 'cafe', 'sensory', 'igraonica'
  content   Json     // Flexible JSON structure
  updatedAt DateTime @updatedAt
  updatedBy String?  // User ID who made the change

  @@index([section])
}

// ============================================
// AUDIT LOGGING
// ============================================

model AuditLog {
  id        String   @id @default(cuid())

  // Who performed the action
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // What was done
  action    String   // 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'
  entity    String   // 'Event', 'Booking', 'User', 'Content'
  entityId  String
  changes   Json?    // Detailed change log

  // Metadata
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

// ============================================
// ENUMS
// ============================================

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
}

enum BookingType {
  CAFE
  SENSORY_ROOM
  PLAYGROUND
  PARTY
  EVENT
}

enum EventStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Key Schema Improvements

1. **Indexes Added**: Performance optimization for common queries
2. **Guest Bookings**: `userId` is optional for non-authenticated bookings
3. **Event Ordering**: `order` field for admin-controlled display order
4. **Audit Trail**: IP address and user agent tracking
5. **Soft Deletes**: `onDelete: SetNull` prevents orphaned records
6. **Slugs**: SEO-friendly URLs for events

---

## Project Structure (Final State)

```
xplorium-sajt/
├── app/
│   ├── (auth)/                    # Auth-related pages
│   │   └── sign-in/              # Optional dedicated sign-in page
│   ├── (public)/                  # Public-facing pages
│   │   ├── page.tsx              # Main landing page (existing)
│   │   └── events/
│   │       └── [slug]/page.tsx   # Public event details
│   ├── admin/                     # 🆕 Admin panel (protected)
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   ├── page.tsx              # Dashboard
│   │   ├── events/
│   │   │   ├── page.tsx          # Events list
│   │   │   ├── new/page.tsx      # Create event
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Event details
│   │   │       └── edit/page.tsx # Edit event
│   │   ├── bookings/
│   │   │   ├── page.tsx          # Bookings list
│   │   │   └── [id]/page.tsx     # Booking details
│   │   ├── users/
│   │   │   ├── page.tsx          # Users list
│   │   │   └── [id]/page.tsx     # User details
│   │   ├── content/
│   │   │   ├── cafe/page.tsx
│   │   │   ├── sensory/page.tsx
│   │   │   └── igraonica/page.tsx
│   │   ├── audit/page.tsx        # Audit logs
│   │   └── settings/page.tsx     # Site settings
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts  # NextAuth handler
│   │   ├── uploadthing/          # 🆕 File upload callbacks
│   │   │   ├── core.ts
│   │   │   └── route.ts
│   │   └── webhooks/             # External webhooks
│   │       └── resend/route.ts
│   ├── actions/                   # 🆕 Server Actions
│   │   ├── auth.ts               # Sign up, sign in
│   │   ├── bookings.ts           # CRUD + approve/reject
│   │   ├── events.ts             # CRUD + reorder
│   │   ├── users.ts              # User management
│   │   ├── content.ts            # Content updates
│   │   └── audit.ts              # Audit log queries
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── admin/                     # 🆕 Admin-specific components
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── DataTable.tsx         # Reusable table with sorting/filtering
│   │   ├── StatsCard.tsx
│   │   ├── BookingCard.tsx
│   │   ├── EventEditor.tsx
│   │   ├── ContentEditor.tsx
│   │   ├── ImageUpload.tsx
│   │   └── UserRoleSelector.tsx
│   ├── auth/                      # Auth components (existing, needs updates)
│   │   ├── SignInModal.tsx       # ✏️ Update to use NextAuth
│   │   ├── SignUpModal.tsx       # ✏️ Update to call server action
│   │   └── AuthButtons.tsx
│   ├── animations/
│   ├── common/
│   ├── ui/                        # shadcn/ui components
│   └── ErrorBoundary.tsx
├── lib/
│   ├── auth.ts                    # 🆕 NextAuth configuration
│   ├── auth.config.ts             # 🆕 Auth config (for middleware)
│   ├── db.ts                      # 🆕 Prisma client singleton
│   ├── email.ts                   # 🆕 Email utilities (Resend)
│   ├── audit.ts                   # 🆕 Audit logging utility
│   ├── password.ts                # 🆕 bcrypt utilities
│   ├── validations.ts             # 🆕 Zod schemas
│   ├── uploadthing.ts             # 🆕 Uploadthing config
│   └── utils.ts                   # Existing utilities
├── prisma/
│   ├── schema.prisma              # 🆕 Database schema
│   ├── seed.ts                    # 🆕 Seed script (create admin)
│   └── migrations/                # Generated migrations
├── types/
│   ├── index.ts
│   ├── common.ts
│   ├── navigation.ts
│   ├── admin.ts                   # 🆕 Admin-specific types
│   └── database.ts                # 🆕 Prisma-generated types re-export
├── hooks/
├── features/
├── constants/
├── middleware.ts                  # 🆕 Route protection
├── .env.local                     # 🆕 Environment variables
├── .env.example                   # 🆕 Example env file
└── [existing config files]
```

**Legend:**
- 🆕 = New file/folder
- ✏️ = Needs modification

---

## Phase-by-Phase Migration Plan

### **Phase 1: Foundation Setup** (Week 1, Days 1-3)

#### **Day 1: Dependencies & Database**

**Install Dependencies:**
```bash
npm install next-auth@beta @prisma/client prisma bcryptjs @tanstack/react-table
npm install uploadthing @uploadthing/react
npm install resend react-email @react-email/components
npm install date-fns react-day-picker
npm install -D @types/bcryptjs
```

**Initialize Prisma:**
```bash
npx prisma init
```

**Tasks:**
1. ✅ Create `prisma/schema.prisma` with full schema (provided above)
2. ✅ Create `.env.local` with environment variables
3. ✅ Create `lib/db.ts` for Prisma client singleton
4. ✅ Run initial migration: `npx prisma migrate dev --name init`
5. ✅ Generate Prisma Client: `npx prisma generate`

**Deliverables:**
- [ ] `prisma/schema.prisma` created
- [ ] Database migrated successfully
- [ ] Prisma Client generated
- [ ] `lib/db.ts` utility created

---

#### **Day 2: Authentication Setup**

**Create Auth Files:**

1. **`lib/password.ts`** - bcrypt utilities
2. **`lib/auth.config.ts`** - Auth configuration (for middleware)
3. **`lib/auth.ts`** - NextAuth setup with Credentials provider
4. **`app/api/auth/[...nextauth]/route.ts`** - NextAuth API route
5. **`middleware.ts`** - Route protection
6. **`lib/validations.ts`** - Zod schemas for auth

**Seed Admin User:**
```bash
npx prisma db seed
```

**Tasks:**
1. ✅ Implement password hashing/comparison utilities
2. ✅ Configure NextAuth v5 with credentials provider
3. ✅ Set up middleware for `/admin/*` route protection
4. ✅ Create validation schemas for sign-in/sign-up
5. ✅ Create seed script to generate initial admin account
6. ✅ Test authentication flow manually

**Deliverables:**
- [ ] NextAuth configured with credentials provider
- [ ] Middleware protecting `/admin` routes
- [ ] Seed admin user created (email: admin@xplorium.com)
- [ ] Auth validation schemas created

---

#### **Day 3: Server Actions Foundation**

**Create Action Files:**

1. **`app/actions/auth.ts`** - Sign up, sign in helpers
2. **`app/actions/bookings.ts`** - Booking CRUD + approve/reject
3. **`app/actions/events.ts`** - Event CRUD + reordering
4. **`app/actions/users.ts`** - User management
5. **`lib/audit.ts`** - Audit logging utility

**Tasks:**
1. ✅ Create base server actions with auth checks
2. ✅ Implement audit logging utility
3. ✅ Add error handling patterns
4. ✅ Set up revalidation strategy
5. ✅ Create TypeScript types for action responses

**Deliverables:**
- [ ] Server actions scaffold created
- [ ] Auth middleware for actions implemented
- [ ] Audit logging integrated
- [ ] Error handling standardized

---

### **Phase 2: Admin UI Foundation** (Week 1, Days 4-5)

#### **Day 4: Admin Layout & Sidebar**

**Create Components:**

1. **`app/admin/layout.tsx`** - Admin layout with auth check
2. **`components/admin/AdminSidebar.tsx`** - Navigation sidebar
3. **`components/admin/AdminHeader.tsx`** - Header with user menu

**Features:**
- Responsive sidebar (collapsible on mobile)
- Active link highlighting
- Pending bookings badge (real-time count)
- User dropdown with sign-out
- Neon theme styling (matching main site)

**Tasks:**
1. ✅ Create admin layout with sidebar/main grid
2. ✅ Build responsive sidebar with navigation
3. ✅ Add header with user profile dropdown
4. ✅ Implement sign-out functionality
5. ✅ Add loading states with Suspense

**Deliverables:**
- [ ] Admin layout created
- [ ] Sidebar with navigation
- [ ] Header with user menu
- [ ] Responsive design working

---

#### **Day 5: Dashboard Page**

**Create:**

1. **`app/admin/page.tsx`** - Dashboard
2. **`components/admin/StatsCard.tsx`** - Reusable stat card
3. **`app/actions/dashboard.ts`** - Dashboard data fetching

**Dashboard Features:**
- Stats cards (bookings, pending requests, users, events)
- Recent bookings list
- Upcoming events list
- Quick actions panel
- Charts (bookings over time, bookings by type)

**Tasks:**
1. ✅ Create dashboard page with stats overview
2. ✅ Build reusable StatsCard component
3. ✅ Add charts with Recharts
4. ✅ Implement recent activity feed
5. ✅ Add quick action buttons

**Deliverables:**
- [ ] Dashboard page with stats
- [ ] StatsCard component
- [ ] Charts displaying data
- [ ] Recent activity feed

---

### **Phase 3: Core Features** (Week 2)

#### **Bookings Management** (Days 6-7)

**Create:**

1. **`app/admin/bookings/page.tsx`** - Bookings list
2. **`app/admin/bookings/[id]/page.tsx`** - Booking details
3. **`components/admin/BookingCard.tsx`** - Booking display
4. **`components/admin/DataTable.tsx`** - Reusable table

**Features:**
- List all bookings with filters (status, date range, type)
- Approve/reject buttons with confirmation
- Admin notes field
- Email notifications on status change
- Search functionality
- Export to CSV

**Server Actions:**
```typescript
// app/actions/bookings.ts
- getBookings(filters)
- getBookingById(id)
- approveBooking(id, adminNotes)
- rejectBooking(id, reason)
- updateBooking(id, data)
- deleteBooking(id)
```

**Tasks:**
1. ✅ Implement bookings server actions
2. ✅ Create bookings list page with filtering
3. ✅ Build booking details page
4. ✅ Add approve/reject workflow
5. ✅ Integrate email notifications
6. ✅ Add search and CSV export

**Deliverables:**
- [ ] Bookings management complete
- [ ] Approve/reject workflow working
- [ ] Email notifications sending
- [ ] Search and filtering functional

---

#### **Events Management** (Days 8-9)

**Create:**

1. **`app/admin/events/page.tsx`** - Events list
2. **`app/admin/events/new/page.tsx`** - Create event
3. **`app/admin/events/[id]/edit/page.tsx`** - Edit event
4. **`components/admin/EventEditor.tsx`** - Event form
5. **`components/admin/ImageUpload.tsx`** - Image uploader

**Features:**
- CRUD operations
- Rich text editor for description (Tiptap)
- Image upload with preview
- Drag-and-drop reordering
- Status toggle (draft/published/archived)
- Slug generation from title

**Server Actions:**
```typescript
// app/actions/events.ts
- getEvents(filters)
- getEventById(id)
- createEvent(data)
- updateEvent(id, data)
- deleteEvent(id)
- reorderEvents(newOrder)
```

**File Upload Setup:**
```typescript
// lib/uploadthing.ts
- Configure Uploadthing
- Create file router for events
- Set max file size (4MB)
```

**Tasks:**
1. ✅ Set up Uploadthing for image uploads
2. ✅ Implement event server actions
3. ✅ Create event editor with rich text
4. ✅ Add image upload component
5. ✅ Implement drag-and-drop reordering
6. ✅ Add slug auto-generation

**Deliverables:**
- [ ] Event CRUD complete
- [ ] Image upload working
- [ ] Rich text editor integrated
- [ ] Drag-and-drop reordering functional

---

### **Phase 4: Additional Features** (Week 3)

#### **User Management** (Days 10-11)

**Create:**

1. **`app/admin/users/page.tsx`** - Users list
2. **`app/admin/users/[id]/page.tsx`** - User details
3. **`components/admin/UserRoleSelector.tsx`** - Role management

**Features:**
- List all users with search
- Create admin accounts
- Change user roles
- Block/unblock users
- View user activity (bookings, audit logs)

**Server Actions:**
```typescript
// app/actions/users.ts
- getUsers(filters)
- getUserById(id)
- createUser(data)
- updateUserRole(id, role)
- toggleUserBlock(id)
- deleteUser(id)
```

**Tasks:**
1. ✅ Implement user management actions
2. ✅ Create users list with search
3. ✅ Build user details page
4. ✅ Add role selector component
5. ✅ Implement block/unblock functionality

**Deliverables:**
- [ ] User management complete
- [ ] Role changes working
- [ ] User blocking functional

---

#### **Email Notifications** (Days 12-13)

**Setup Resend:**

```bash
npm install resend react-email @react-email/components
```

**Create Email Templates:**

1. **`emails/BookingConfirmation.tsx`** - User submits booking
2. **`emails/BookingApproved.tsx`** - Admin approves
3. **`emails/BookingRejected.tsx`** - Admin rejects
4. **`emails/WelcomeEmail.tsx`** - New user registration

**Email Utility:**
```typescript
// lib/email.ts
- sendBookingConfirmation(booking)
- sendBookingApproval(booking)
- sendBookingRejection(booking, reason)
- sendWelcomeEmail(user)
```

**Tasks:**
1. ✅ Set up Resend API
2. ✅ Create email templates with React Email
3. ✅ Implement email sending utility
4. ✅ Integrate with booking workflow
5. ✅ Add error handling and retries

**Deliverables:**
- [ ] Resend configured
- [ ] Email templates created
- [ ] Emails sending on booking actions

---

#### **Content Management** (Days 14-15)

**Create:**

1. **`app/admin/content/cafe/page.tsx`** - Cafe editor
2. **`app/admin/content/sensory/page.tsx`** - Sensory editor
3. **`app/admin/content/igraonica/page.tsx`** - Playground editor
4. **`components/admin/ContentEditor.tsx`** - Generic editor

**Features:**
- Edit section content (text, images)
- Menu items CRUD (for Cafe)
- Pricing editor
- Live preview
- Version history (optional)

**Server Actions:**
```typescript
// app/actions/content.ts
- getContentBySection(section)
- updateContent(section, data)
- getContentHistory(section) // optional
```

**Tasks:**
1. ✅ Implement content server actions
2. ✅ Create content editor pages
3. ✅ Build generic editor component
4. ✅ Add live preview functionality
5. ✅ Integrate with existing frontend sections

**Deliverables:**
- [ ] Content editor working
- [ ] Changes reflected on public site
- [ ] Preview functionality working

---

### **Phase 5: Integration & Polish** (Week 4)

#### **Update Existing Components** (Days 16-17)

**Files to Modify:**

1. **`components/auth/SignInModal.tsx`**
   - Connect to NextAuth `signIn()`
   - Handle auth errors
   - Redirect admins to `/admin`

2. **`components/auth/SignUpModal.tsx`**
   - Call `signUp` server action
   - Auto sign-in after registration
   - Show success message

3. **Booking form component** (if exists)
   - Submit to `createBooking` server action
   - Show success/error toasts
   - Reset form after submission

**Tasks:**
1. ✅ Update SignInModal to use NextAuth
2. ✅ Update SignUpModal to use server action
3. ✅ Update booking forms to submit to database
4. ✅ Add loading states and error handling
5. ✅ Test complete user flow

**Deliverables:**
- [ ] Auth modals integrated
- [ ] Booking submissions working
- [ ] User flow tested end-to-end

---

#### **Audit Logging & Settings** (Days 18-19)

**Create:**

1. **`app/admin/audit/page.tsx`** - Audit log viewer
2. **`app/admin/settings/page.tsx`** - Site settings

**Audit Features:**
- Filter by user, action, entity
- Date range filtering
- Detailed change logs
- Export to CSV

**Settings Features:**
- Site configuration (name, description)
- Contact information
- Working hours
- Email notification toggles

**Tasks:**
1. ✅ Create audit log viewer
2. ✅ Implement filtering and search
3. ✅ Create settings page
4. ✅ Add settings CRUD
5. ✅ Test audit trail completeness

**Deliverables:**
- [ ] Audit logs viewable
- [ ] Settings page functional

---

#### **Testing & Optimization** (Days 20-21)

**Testing Checklist:**

**Unit Tests (Vitest):**
- [ ] Auth utilities (password hashing)
- [ ] Server actions (mock Prisma)
- [ ] Validation schemas
- [ ] Email formatting

**E2E Tests (Playwright):**
- [ ] Admin login flow
- [ ] Booking approval workflow
- [ ] Event CRUD operations
- [ ] User role changes

**Performance:**
- [ ] Database query optimization (add indexes)
- [ ] Image optimization (Uploadthing auto-optimization)
- [ ] Loading states for slow queries
- [ ] Implement caching where appropriate

**Tasks:**
1. ✅ Write unit tests for critical paths
2. ✅ Write E2E tests for workflows
3. ✅ Run performance profiling
4. ✅ Optimize database queries
5. ✅ Fix any build errors

**Deliverables:**
- [ ] Test suite passing
- [ ] Performance optimized
- [ ] Build succeeding

---

### **Phase 6: Deployment** (Week 4, Days 22-24)

#### **Pre-Deployment Checklist**

**Environment Setup:**
- [ ] Set up Vercel Postgres (production)
- [ ] Configure Resend production keys
- [ ] Set up Uploadthing production app
- [ ] Generate secure `NEXTAUTH_SECRET`
- [ ] Configure environment variables in Vercel

**Database:**
- [ ] Run migrations on production
- [ ] Seed initial admin account
- [ ] Set up automated backups

**Security:**
- [ ] Enable rate limiting on auth routes
- [ ] Configure CORS policies
- [ ] Set up CSP headers
- [ ] Enable security headers

**Monitoring:**
- [ ] Set up error tracking (Sentry optional)
- [ ] Configure Vercel Analytics
- [ ] Set up uptime monitoring
- [ ] Enable logging

**Tasks:**
1. ✅ Set up production database
2. ✅ Configure all environment variables
3. ✅ Run production migrations
4. ✅ Deploy to Vercel
5. ✅ Test all features in production
6. ✅ Monitor for errors

**Deliverables:**
- [ ] Application deployed
- [ ] All features working in production
- [ ] Monitoring active

---

## Code Examples

### Server Action Pattern

```typescript
// app/actions/bookings.ts
'use server'

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

// Validation schema
const ApproveBookingSchema = z.object({
  bookingId: z.string().cuid(),
  adminNotes: z.string().optional(),
});

// Type-safe action
export async function approveBooking(
  bookingId: string,
  adminNotes?: string
) {
  // 1. Authenticate
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: 'Unauthorized' };
  }

  // 2. Validate input
  const validation = ApproveBookingSchema.safeParse({ bookingId, adminNotes });
  if (!validation.success) {
    return { error: 'Invalid input' };
  }

  try {
    // 3. Update database
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'APPROVED',
        adminNotes,
      },
      include: { user: true },
    });

    // 4. Send email
    await sendEmail({
      to: booking.email,
      template: 'booking-approved',
      data: booking,
    });

    // 5. Audit log
    await logAudit({
      userId: session.user.id,
      action: 'APPROVE',
      entity: 'Booking',
      entityId: bookingId,
      changes: { status: 'APPROVED', adminNotes },
    });

    // 6. Revalidate cache
    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, booking };
  } catch (error) {
    console.error('Failed to approve booking:', error);
    return { error: 'Failed to approve booking' };
  }
}
```

### Server Component Data Fetching

```typescript
// app/admin/bookings/page.tsx
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { BookingsList } from '@/components/admin/BookingsList';

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  // Auth check (also protected by middleware)
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/');
  }

  // Direct Prisma query in Server Component
  const bookings = await prisma.booking.findMany({
    where: {
      ...(searchParams.status && { status: searchParams.status }),
      ...(searchParams.search && {
        OR: [
          { email: { contains: searchParams.search, mode: 'insensitive' } },
          { title: { contains: searchParams.search, mode: 'insensitive' } },
        ],
      }),
    },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  return <BookingsList bookings={bookings} />;
}
```

### Client Component with Server Action

```typescript
// components/admin/BookingCard.tsx
'use client'

import { approveBooking, rejectBooking } from '@/app/actions/bookings';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export function BookingCard({ booking }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState('');

  function handleApprove() {
    startTransition(async () => {
      const result = await approveBooking(booking.id, notes);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Booking approved!');
      }
    });
  }

  return (
    <div className="booking-card">
      {/* Booking details */}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Admin notes..."
      />

      <button
        onClick={handleApprove}
        disabled={isPending}
      >
        {isPending ? 'Approving...' : 'Approve'}
      </button>
    </div>
  );
}
```

---

## Environment Variables

Create `.env.local`:

```bash
# Database (Vercel Postgres)
DATABASE_URL="postgres://username:password@host/database"
POSTGRES_PRISMA_URL="postgres://username:password@host/database?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://username:password@host/database"

# Auth (NextAuth v5)
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@xplorium.com"

# File Upload (Uploadthing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Optional: Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

Create `.env.example`:

```bash
# Database
DATABASE_URL="postgres://..."

# Auth
AUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@example.com"

# File Upload
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."
```

---

## Security Considerations

### 1. **Authentication & Authorization**

- ✅ NextAuth session-based auth
- ✅ Middleware protection on `/admin/*` routes
- ✅ Role-based access control (RBAC)
- ✅ Server action auth checks
- ✅ Password hashing (bcrypt, 12 rounds)

### 2. **Input Validation**

- ✅ Zod validation on all inputs
- ✅ Client-side validation (UX)
- ✅ Server-side validation (security)
- ✅ SQL injection protection (Prisma)

### 3. **Rate Limiting**

Implement on auth routes:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

### 4. **CSRF Protection**

- ✅ Built into Server Actions
- ✅ NextAuth CSRF tokens

### 5. **Data Sanitization**

- ✅ XSS prevention (React auto-escapes)
- ✅ Rich text sanitization (Tiptap)
- ✅ File upload validation (type, size)

---

## Performance Optimization

### Database Indexes

Already added in schema:
- User: `email`, `role`
- Booking: `status`, `date`, `email`, `userId`
- Event: `status`, `date`, `slug`
- AuditLog: `userId`, `entity+entityId`, `createdAt`

### Caching Strategy

```typescript
// app/admin/bookings/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

// Or use dynamic caching
export const dynamic = 'force-dynamic'; // Always fetch fresh
```

### Image Optimization

- ✅ Uploadthing automatic compression
- ✅ Next.js Image component
- ✅ CDN delivery

### Code Splitting

- ✅ Automatic with Next.js App Router
- ✅ Lazy load admin components
- ✅ Dynamic imports for heavy components

---

## Migration Checklist

### Pre-Implementation
- [ ] Review architecture with team
- [ ] Set up development database
- [ ] Create project board for tracking
- [ ] Assign tasks to developers

### Week 1: Foundation
- [ ] Install all dependencies
- [ ] Set up Prisma with PostgreSQL
- [ ] Configure NextAuth v5
- [ ] Create middleware for route protection
- [ ] Build admin layout and sidebar
- [ ] Create dashboard page

### Week 2: Core Features
- [ ] Implement bookings management
- [ ] Set up email notifications
- [ ] Implement events management
- [ ] Configure file uploads

### Week 3: Additional Features
- [ ] Build user management
- [ ] Create content management system
- [ ] Implement audit logging
- [ ] Update existing components

### Week 4: Testing & Deployment
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] Monitor and fix issues

---

## Success Metrics

### Functionality
- ✅ All CRUD operations working
- ✅ Email notifications sending
- ✅ File uploads successful
- ✅ Authentication secure

### Performance
- ✅ Page load < 2s
- ✅ Database queries < 200ms
- ✅ 95+ Lighthouse score

### Security
- ✅ All routes protected
- ✅ Input validated
- ✅ Audit logs complete
- ✅ No security warnings

### User Experience
- ✅ Responsive design
- ✅ Intuitive navigation
- ✅ Loading states
- ✅ Error handling

---

## Support & Resources

### Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [NextAuth v5 Docs](https://authjs.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Resend Docs](https://resend.com/docs)
- [Uploadthing Docs](https://docs.uploadthing.com/)

### Community
- Next.js Discord
- Prisma Discord
- Stack Overflow

---

**Last Updated:** 2025-11-18
**Version:** 1.0
**Status:** Ready for Implementation
