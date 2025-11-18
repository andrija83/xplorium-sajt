# Admin Panel Implementation TODO List

## Overview
This document outlines all tasks required to implement a comprehensive Admin Panel for the Xplorium application using **modern Next.js 16 architecture** with Server Actions, NextAuth v5, and Prisma.

> **📖 Companion Document:** See `docs/BACKEND_MIGRATION_PLAN.md` for detailed implementation guide, code examples, and architectural decisions.

---

## Architecture Summary

### Tech Stack (Updated)
- **Database:** PostgreSQL (Vercel Postgres recommended)
- **ORM:** Prisma with enhanced schema
- **Authentication:** NextAuth.js v5 (Auth.js) with middleware
- **Data Mutations:** Server Actions (primary) + API Routes (webhooks only)
- **Email:** Resend (modern, simple API)
- **File Upload:** Uploadthing or Vercel Blob
- **Validation:** Zod (already in package.json)
- **Charts:** Recharts (already in package.json)

### Key Changes from Original Plan
1. ✅ **Server Actions over API Routes** - Less boilerplate, better type safety
2. ✅ **NextAuth v5 Middleware** - Built-in route protection
3. ✅ **Enhanced Database Schema** - Added indexes, audit trails, guest bookings
4. ✅ **Resend for Email** - Better deliverability than Nodemailer
5. ✅ **Audit Logging from Day 1** - Track all admin actions

---

## Phase 1: Foundation & Setup

### 1. Dependencies Installation
- [ ] Install NextAuth v5 (`next-auth@beta`)
- [ ] Install Prisma (`@prisma/client`, `prisma`)
- [ ] Install bcryptjs (`bcryptjs`, `@types/bcryptjs`)
- [ ] Install TanStack Table (`@tanstack/react-table`)
- [ ] Install Uploadthing (`uploadthing`, `@uploadthing/react`)
- [ ] Install Resend (`resend`, `react-email`, `@react-email/components`)
- [ ] Install date utilities (`date-fns`, `react-day-picker`)

**Command:**
```bash
npm install next-auth@beta @prisma/client prisma bcryptjs @tanstack/react-table uploadthing @uploadthing/react resend react-email @react-email/components date-fns react-day-picker
npm install -D @types/bcryptjs
```

### 2. Database Setup (Enhanced Schema)
- [ ] Initialize Prisma (`npx prisma init`)
- [ ] Create enhanced Prisma schema (see migration plan)
  - [ ] User model with `blocked` field and `image` field
  - [ ] Booking model with optional `userId` (guest bookings), `adminNotes`
  - [ ] Event model with `slug`, `order` (drag-drop), `EventStatus` enum
  - [ ] SiteContent model with `updatedBy` tracking
  - [ ] AuditLog model with `ipAddress`, `userAgent`, `changes` JSON
  - [ ] Enhanced enums: `BookingType` (CAFE, SENSORY_ROOM, PLAYGROUND, PARTY, EVENT)
  - [ ] Add database indexes for performance
- [ ] Run initial migration (`npx prisma migrate dev --name init`)
- [ ] Generate Prisma Client (`npx prisma generate`)
- [ ] Create database connection utility (`lib/db.ts`)
- [ ] Create seed script (`prisma/seed.ts`) for initial admin account

**Deliverables:**
- ✅ Full schema with indexes
- ✅ Migrations applied
- ✅ Seed admin user created

### 3. Authentication Setup (NextAuth v5)
- [ ] Create password utilities (`lib/password.ts` - bcrypt hash/compare)
- [ ] Create auth config for middleware (`lib/auth.config.ts`)
- [ ] Create main auth config (`lib/auth.ts`) with Credentials provider
- [ ] Create NextAuth API route (`app/api/auth/[...nextauth]/route.ts`)
- [ ] Export auth handlers (`{ handlers, signIn, signOut, auth }`)
- [ ] Create validation schemas (`lib/validations.ts` - Zod schemas for auth)

**Deliverables:**
- ✅ NextAuth v5 configured
- ✅ Session management working
- ✅ Password hashing (bcrypt, 12 rounds)

### 4. Security & Route Protection
- [ ] Create `middleware.ts` for admin route protection
  - [ ] Use `auth` from NextAuth as middleware
  - [ ] Protect `/admin/*` routes
  - [ ] Check user role (ADMIN or SUPER_ADMIN)
  - [ ] Redirect unauthorized users
- [ ] Implement role-based access control (RBAC) in auth config
- [ ] Add CSRF protection (built into Server Actions)
- [ ] Add rate limiting to auth routes (optional: Upstash)
- [ ] Create input validation schemas with Zod

**Deliverables:**
- ✅ Middleware protecting admin routes
- ✅ RBAC implemented
- ✅ Validation schemas created

---

## Phase 2: Server Actions Foundation (NEW)

### 5. Create Server Actions Structure
- [ ] Create `app/actions/` directory
- [ ] Create `app/actions/auth.ts`
  - [ ] `signUp(email, password, name)` - Create user account
  - [ ] Helper functions for auth operations
- [ ] Create `app/actions/bookings.ts`
  - [ ] `getBookings(filters)` - List bookings
  - [ ] `getBookingById(id)` - Get single booking
  - [ ] `approveBooking(id, adminNotes)` - Approve booking
  - [ ] `rejectBooking(id, reason)` - Reject booking
  - [ ] `updateBooking(id, data)` - Update booking
  - [ ] `deleteBooking(id)` - Delete booking
- [ ] Create `app/actions/events.ts`
  - [ ] `getEvents(filters)` - List events
  - [ ] `getEventById(id)` - Get single event
  - [ ] `createEvent(data)` - Create event
  - [ ] `updateEvent(id, data)` - Update event
  - [ ] `deleteEvent(id)` - Delete event
  - [ ] `reorderEvents(newOrder)` - Drag-drop reordering
- [ ] Create `app/actions/users.ts`
  - [ ] `getUsers(filters)` - List users
  - [ ] `getUserById(id)` - Get user details
  - [ ] `createUser(data)` - Create user/admin
  - [ ] `updateUserRole(id, role)` - Change role
  - [ ] `toggleUserBlock(id)` - Block/unblock user
  - [ ] `deleteUser(id)` - Delete user
- [ ] Create `app/actions/content.ts`
  - [ ] `getContentBySection(section)` - Get section content
  - [ ] `updateContent(section, data)` - Update content
- [ ] Create `app/actions/dashboard.ts`
  - [ ] `getDashboardStats()` - Get stats for dashboard

**Patterns to Follow:**
- ✅ Auth check at start of every action
- ✅ Zod validation for inputs
- ✅ Try-catch error handling
- ✅ `revalidatePath()` after mutations
- ✅ Audit logging for important actions
- ✅ Return `{ success, data, error }` pattern

### 6. Create Audit Logging Utility
- [ ] Create `lib/audit.ts`
  - [ ] `logAudit(userId, action, entity, entityId, changes, ipAddress, userAgent)`
  - [ ] Helper to get IP and user agent from headers
- [ ] Integrate audit logging into server actions
  - [ ] Log booking approvals/rejections
  - [ ] Log event creation/updates/deletion
  - [ ] Log user role changes
  - [ ] Log content updates

**Deliverables:**
- ✅ All server actions created
- ✅ Auth checks in place
- ✅ Audit logging integrated

---

## Phase 3: Admin Layout & UI

### 7. Admin Layout Structure
- [ ] Create admin layout component (`app/admin/layout.tsx`)
  - [ ] Auth check (redirect if not admin)
  - [ ] Set up responsive sidebar/main content grid
  - [ ] Apply consistent neon theme styling
  - [ ] Add loading states with Suspense
  - [ ] Add error boundary

**Layout Structure:**
```
Grid: Sidebar (240px) | Main Content (flex-1)
Mobile: Collapsible sidebar
```

### 8. Admin Sidebar Component
- [ ] Create AdminSidebar component (`components/admin/AdminSidebar.tsx`)
- [ ] Add navigation links with icons (lucide-react):
  - [ ] Dashboard (LayoutDashboard icon)
  - [ ] Events Management (Calendar icon)
  - [ ] Booking Requests (ClipboardList icon) - **with pending count badge**
  - [ ] User Management (Users icon)
  - [ ] Content Editor (FileEdit icon)
  - [ ] Audit Logs (Shield icon)
  - [ ] Settings (Settings icon)
  - [ ] Logout (LogOut icon)
- [ ] Add active link highlighting (use `usePathname()`)
- [ ] Make responsive (collapsible on mobile with hamburger menu)
- [ ] Add Xplorium logo at top
- [ ] Style with neon theme (matching main site)

### 9. Admin Header Component
- [ ] Create AdminHeader component (`components/admin/AdminHeader.tsx`)
- [ ] Add mobile menu toggle button
- [ ] Add user profile section with:
  - [ ] User avatar/initials
  - [ ] User name and role badge
  - [ ] Dropdown menu (Profile, Settings, Logout)
- [ ] Add notifications bell icon (optional)
- [ ] Style with neon accents

**Deliverables:**
- ✅ Admin layout with sidebar
- ✅ Responsive design
- ✅ Navigation working

---

## Phase 4: Admin Dashboard Page

### 10. Admin Dashboard Page
- [ ] Create dashboard page (`app/admin/page.tsx`)
- [ ] Fetch data using server actions in Server Component
- [ ] Add statistics overview section (4-column grid):
  - [ ] Total Bookings (with trend)
  - [ ] Pending Requests (with count badge)
  - [ ] Total Users
  - [ ] Upcoming Events
- [ ] Add charts section:
  - [ ] Bookings over time (line chart with Recharts)
  - [ ] Bookings by type (pie chart)
- [ ] Add recent activity feed:
  - [ ] Recent bookings (last 5)
  - [ ] Recent events (last 3)
- [ ] Add quick actions panel:
  - [ ] Create Event button
  - [ ] View Pending Bookings button
  - [ ] Create Admin User button

### 11. StatsCard Component
- [ ] Create StatsCard component (`components/admin/StatsCard.tsx`)
- [ ] Props: `title`, `value`, `icon`, `trend` (optional), `onClick` (optional)
- [ ] Display icon from lucide-react
- [ ] Show value with large font
- [ ] Show trend indicator (up/down arrow with percentage)
- [ ] Add hover effect and cursor pointer if clickable
- [ ] Style with glass morphism and neon border

**Deliverables:**
- ✅ Dashboard with stats
- ✅ Charts displaying data
- ✅ Recent activity feed

---

## Phase 5: Bookings Management

### 12. Bookings List Page
- [ ] Create bookings list page (`app/admin/bookings/page.tsx`)
- [ ] Fetch bookings using direct Prisma query in Server Component
- [ ] Add filter controls (Client Component):
  - [ ] Status filter (All, Pending, Approved, Rejected, Cancelled)
  - [ ] Date range picker
  - [ ] Booking type filter
  - [ ] Search by email/title
- [ ] Display using DataTable component
- [ ] Add bulk actions (optional):
  - [ ] Approve selected
  - [ ] Reject selected
  - [ ] Export selected
- [ ] Add export to CSV button
- [ ] Show pending count badge in header

### 13. Booking Details Page
- [ ] Create booking details page (`app/admin/bookings/[id]/page.tsx`)
- [ ] Display full booking information
- [ ] Add BookingCard component for layout
- [ ] Show user information (if registered user)
- [ ] Add admin notes textarea
- [ ] Add action buttons:
  - [ ] Approve (green neon)
  - [ ] Reject (red neon)
  - [ ] Cancel
  - [ ] Delete (with confirmation)
- [ ] Show booking status with colored badge
- [ ] Display created/updated timestamps
- [ ] Add back button to list

### 14. BookingCard Component
- [ ] Create BookingCard component (`components/admin/BookingCard.tsx`)
- [ ] Display booking details in card layout
- [ ] Include form for admin notes
- [ ] Add approve/reject buttons with loading states
- [ ] Use `useTransition()` for optimistic updates
- [ ] Show toast notifications on success/error
- [ ] Disable buttons while action is pending
- [ ] Style with glass morphism

### 15. Email Notifications Integration
- [ ] Set up Resend API
- [ ] Create email templates directory (`emails/`)
- [ ] Create BookingConfirmation email template
- [ ] Create BookingApproved email template
- [ ] Create BookingRejected email template
- [ ] Create email utility (`lib/email.ts`)
  - [ ] `sendBookingConfirmation(booking)`
  - [ ] `sendBookingApproval(booking)`
  - [ ] `sendBookingRejection(booking, reason)`
- [ ] Integrate email sending into booking server actions
- [ ] Add error handling and retry logic

**Deliverables:**
- ✅ Bookings list with filtering
- ✅ Booking details page
- ✅ Approve/reject workflow
- ✅ Email notifications working

---

## Phase 6: Events Management

### 16. Events List Page
- [ ] Create events list page (`app/admin/events/page.tsx`)
- [ ] Fetch events using Server Component
- [ ] Add filter controls:
  - [ ] Status filter (All, Draft, Published, Archived)
  - [ ] Category filter
  - [ ] Date range
  - [ ] Search by title
- [ ] Display in grid/list view (toggle)
- [ ] Add drag-and-drop reordering (use `@dnd-kit/core`)
- [ ] Show event thumbnails
- [ ] Add "Create New Event" button
- [ ] Add bulk actions (publish, archive, delete)

### 17. Create Event Page
- [ ] Create new event page (`app/admin/events/new/page.tsx`)
- [ ] Use EventEditor component
- [ ] Set form defaults (draft status)
- [ ] Handle form submission with server action
- [ ] Redirect to event list on success
- [ ] Show validation errors

### 18. Edit Event Page
- [ ] Create edit event page (`app/admin/events/[id]/edit/page.tsx`)
- [ ] Fetch event data in Server Component
- [ ] Pre-populate EventEditor with data
- [ ] Handle update with server action
- [ ] Add delete button with confirmation
- [ ] Show last updated timestamp

### 19. EventEditor Component
- [ ] Create EventEditor component (`components/admin/EventEditor.tsx`)
- [ ] Add form fields:
  - [ ] Title (text input)
  - [ ] Slug (auto-generated, editable)
  - [ ] Description (rich text editor - Tiptap)
  - [ ] Date (date picker)
  - [ ] Time (time picker)
  - [ ] Category (select)
  - [ ] Image (ImageUpload component)
  - [ ] Status (toggle: Draft/Published/Archived)
- [ ] Add form validation with Zod
- [ ] Show preview mode (toggle view)
- [ ] Add save draft and publish buttons
- [ ] Use `react-hook-form` for form management

### 20. Image Upload System
- [ ] Set up Uploadthing
  - [ ] Create Uploadthing app
  - [ ] Set environment variables
  - [ ] Create file router (`app/api/uploadthing/core.ts`)
  - [ ] Create API route (`app/api/uploadthing/route.ts`)
- [ ] Create ImageUpload component (`components/admin/ImageUpload.tsx`)
  - [ ] Drag-and-drop support
  - [ ] Image preview
  - [ ] File type validation (jpg, png, webp)
  - [ ] File size limit (4MB)
  - [ ] Upload progress indicator
  - [ ] Delete uploaded image
- [ ] Configure Uploadthing client (`lib/uploadthing.ts`)

**Deliverables:**
- ✅ Events CRUD complete
- ✅ Rich text editor working
- ✅ Image upload functional
- ✅ Drag-drop reordering

---

## Phase 7: User Management

### 21. Users List Page
- [ ] Create users list page (`app/admin/users/page.tsx`)
- [ ] Fetch users using Server Component
- [ ] Add search functionality (email, name)
- [ ] Add role filter (All, User, Admin, Super Admin)
- [ ] Add status filter (Active, Blocked)
- [ ] Display in DataTable
- [ ] Show user avatar, name, email, role, status
- [ ] Add "Create Admin" button

### 22. User Details Page
- [ ] Create user details page (`app/admin/users/[id]/page.tsx`)
- [ ] Display user information
- [ ] Show user's bookings history
- [ ] Show user's audit log entries
- [ ] Add UserRoleSelector component
- [ ] Add block/unblock toggle
- [ ] Add delete user button (with confirmation)
- [ ] Prevent self-deletion and self-role-change

### 23. UserRoleSelector Component
- [ ] Create UserRoleSelector component (`components/admin/UserRoleSelector.tsx`)
- [ ] Display current role as badge
- [ ] Add role dropdown (User, Admin, Super Admin)
- [ ] Disable if viewing own profile
- [ ] Require SUPER_ADMIN role to create other SUPER_ADMINs
- [ ] Use server action to update role
- [ ] Show confirmation dialog for role changes
- [ ] Log audit trail on change

### 24. Create Admin Account Form
- [ ] Add form to create admin accounts
- [ ] Fields: name, email, password, role
- [ ] Password requirements (min 8 chars, special chars)
- [ ] Generate random password option
- [ ] Send welcome email with credentials
- [ ] Require SUPER_ADMIN role for this action

**Deliverables:**
- ✅ User management complete
- ✅ Role changes working
- ✅ Block/unblock functional

---

## Phase 8: Content Management System

### 25. Content Editor Pages
- [ ] Create content editor directory (`app/admin/content/`)
- [ ] Create cafe editor (`app/admin/content/cafe/page.tsx`)
  - [ ] Menu items CRUD
  - [ ] Pricing editor
  - [ ] Hours editor
  - [ ] Contact info editor
- [ ] Create sensory room editor (`app/admin/content/sensory/page.tsx`)
  - [ ] Description editor
  - [ ] Features list
  - [ ] Image gallery
- [ ] Create playground editor (`app/admin/content/igraonica/page.tsx`)
  - [ ] Description editor
  - [ ] Activities list
  - [ ] Pricing tiers

### 26. ContentEditor Component
- [ ] Create ContentEditor component (`components/admin/ContentEditor.tsx`)
- [ ] Add rich text editing (Tiptap)
- [ ] Add image gallery management
- [ ] Add JSON form builder for structured content
- [ ] Add live preview panel (split view)
- [ ] Save changes with server action
- [ ] Show last updated info

### 27. Update Public Site to Fetch from Database
- [ ] Update `features/cafe/CafeSection.tsx` to fetch from `SiteContent`
- [ ] Update `features/sensory/SensorySection.tsx` to fetch from `SiteContent`
- [ ] Update `features/igraonica/IgraonicaSection.tsx` to fetch from `SiteContent`
- [ ] Add loading states
- [ ] Add error handling
- [ ] Cache data appropriately

**Deliverables:**
- ✅ Content editor working
- ✅ Changes reflected on public site
- ✅ Preview functional

---

## Phase 9: Additional Features

### 28. DataTable Component (Reusable)
- [ ] Create DataTable component (`components/admin/DataTable.tsx`)
- [ ] Use `@tanstack/react-table`
- [ ] Features:
  - [ ] Column sorting (ascending/descending)
  - [ ] Search/filtering
  - [ ] Pagination (10, 25, 50, 100 per page)
  - [ ] Row selection (checkboxes)
  - [ ] Bulk actions bar
  - [ ] Export to CSV
  - [ ] Column visibility toggle
  - [ ] Responsive (stack on mobile)
- [ ] Style with neon theme
- [ ] Add loading skeleton

### 29. Audit Logs Viewer
- [ ] Create audit log page (`app/admin/audit/page.tsx`)
- [ ] Fetch logs using server action
- [ ] Add filters:
  - [ ] User (dropdown)
  - [ ] Action (CREATE, UPDATE, DELETE, APPROVE, REJECT)
  - [ ] Entity (Event, Booking, User, Content)
  - [ ] Date range
- [ ] Display in DataTable
- [ ] Show detailed changes on click (JSON viewer)
- [ ] Add export to CSV
- [ ] Paginate results (server-side pagination)

### 30. Settings Page
- [ ] Create settings page (`app/admin/settings/page.tsx`)
- [ ] Add sections:
  - [ ] Site Configuration (name, description, logo)
  - [ ] Contact Information (email, phone, address)
  - [ ] Working Hours (day-by-day editor)
  - [ ] Email Notifications (toggle on/off)
  - [ ] Social Media Links
- [ ] Save settings to database (separate Settings model or use SiteContent)
- [ ] Add form validation
- [ ] Show success toast on save

### 31. Export Functionality
- [ ] Create export utility (`lib/export.ts`)
  - [ ] `exportToCSV(data, filename)`
  - [ ] `exportToExcel(data, filename)` (optional)
- [ ] Add export buttons to:
  - [ ] Bookings list
  - [ ] Events list
  - [ ] Users list
  - [ ] Audit logs
- [ ] Add date range selector for exports
- [ ] Add column selector (choose which columns to export)
- [ ] Generate and download file on client

**Deliverables:**
- ✅ Reusable DataTable component
- ✅ Audit logs viewable
- ✅ Settings page functional
- ✅ Export working

---

## Phase 10: Update Existing Components

### 32. Update SignInModal
- [ ] Update `components/auth/SignInModal.tsx`
- [ ] Import `signIn` from `next-auth/react`
- [ ] Call `signIn('credentials', { ... })` on form submit
- [ ] Handle authentication errors
- [ ] Check user role after sign-in
- [ ] Redirect admins to `/admin` dashboard
- [ ] Redirect regular users to homepage
- [ ] Show loading state during sign-in
- [ ] Add "Forgot Password" link (optional)

### 33. Update SignUpModal
- [ ] Update `components/auth/SignUpModal.tsx`
- [ ] Call `signUp` server action from `app/actions/auth.ts`
- [ ] Validate password strength (min 8 chars, special chars)
- [ ] Create user account in database
- [ ] Send welcome email (optional)
- [ ] Auto sign-in after registration
- [ ] Redirect to homepage
- [ ] Show success toast

### 34. Update Booking Form (if exists)
- [ ] Find existing booking form component
- [ ] Update to submit to `createBooking` server action
- [ ] Add form validation (Zod)
- [ ] Show loading state during submission
- [ ] Show success toast with booking reference
- [ ] Send confirmation email to user
- [ ] Reset form after successful submission
- [ ] Handle errors gracefully

### 35. Update Event Calendar (if exists)
- [ ] Find existing event calendar component
- [ ] Fetch events from database using server action
- [ ] Filter by published status
- [ ] Add loading skeleton
- [ ] Add error boundary
- [ ] Cache data appropriately
- [ ] Add click handler to view event details

**Deliverables:**
- ✅ Auth modals integrated
- ✅ Booking form submitting to database
- ✅ Event calendar fetching from database

---

## Phase 11: Testing & Quality Assurance

### 36. Unit Tests (Vitest)
- [ ] Test auth utilities (`lib/password.ts`)
  - [ ] Password hashing
  - [ ] Password comparison
- [ ] Test validation schemas (`lib/validations.ts`)
  - [ ] Auth schemas
  - [ ] Booking schemas
  - [ ] Event schemas
- [ ] Test email formatting (`lib/email.ts`)
  - [ ] Template rendering
  - [ ] Data interpolation
- [ ] Test export utilities (`lib/export.ts`)
  - [ ] CSV generation
  - [ ] Data formatting

### 37. Integration Tests (Playwright)
- [ ] Test authentication flow
  - [ ] Sign in with valid credentials
  - [ ] Sign in with invalid credentials
  - [ ] Sign up new user
  - [ ] Sign out
  - [ ] Session persistence
- [ ] Test booking workflow
  - [ ] Create booking
  - [ ] Approve booking
  - [ ] Reject booking
  - [ ] Email notification sent
- [ ] Test event management
  - [ ] Create event
  - [ ] Edit event
  - [ ] Upload image
  - [ ] Publish event
  - [ ] Delete event
- [ ] Test user management
  - [ ] Create admin user
  - [ ] Change user role
  - [ ] Block user
  - [ ] Delete user

### 38. Security Testing
- [ ] Test route protection
  - [ ] Unauthenticated access to `/admin/*` blocked
  - [ ] Non-admin users blocked from admin panel
  - [ ] SUPER_ADMIN exclusive features protected
- [ ] Test server action authorization
  - [ ] Actions require authentication
  - [ ] Role checks enforced
- [ ] Test input validation
  - [ ] SQL injection attempts blocked (Prisma)
  - [ ] XSS attempts sanitized (React)
  - [ ] Invalid data rejected (Zod)

### 39. Performance Testing
- [ ] Run Lighthouse audit
  - [ ] Target: 95+ score
- [ ] Test database query performance
  - [ ] All queries < 200ms
  - [ ] Proper indexes used
- [ ] Test page load times
  - [ ] Admin pages < 2s
  - [ ] Public pages < 1s
- [ ] Check bundle size
  - [ ] Admin bundle < 500KB
  - [ ] No unnecessary dependencies in client bundles

### 40. Build Verification
- [ ] Run `npm run build`
- [ ] Ensure no TypeScript errors
- [ ] Ensure no ESLint warnings
- [ ] Test production build locally
- [ ] Verify all features work in production mode
- [ ] Check for console errors

**Deliverables:**
- ✅ Test suite passing
- ✅ Security verified
- ✅ Performance optimized
- ✅ Build succeeding

---

## Phase 12: Deployment & Documentation

### 41. Database Deployment
- [ ] Set up Vercel Postgres (production)
  - [ ] Create database in Vercel dashboard
  - [ ] Copy connection strings
- [ ] Run migrations on production
  - [ ] `npx prisma migrate deploy`
- [ ] Seed initial admin account
  - [ ] `npx prisma db seed`
- [ ] Set up automated backups (Vercel built-in)
- [ ] Configure connection pooling

### 42. Environment Configuration
- [ ] Create environment variables in Vercel
  - [ ] `DATABASE_URL`
  - [ ] `POSTGRES_PRISMA_URL`
  - [ ] `POSTGRES_URL_NON_POOLING`
  - [ ] `AUTH_SECRET` (generate with `openssl rand -base64 32`)
  - [ ] `NEXTAUTH_URL` (production URL)
  - [ ] `RESEND_API_KEY`
  - [ ] `RESEND_FROM_EMAIL`
  - [ ] `UPLOADTHING_SECRET`
  - [ ] `UPLOADTHING_APP_ID`
- [ ] Verify all variables are set
- [ ] Test email delivery in production
- [ ] Test file uploads in production

### 43. Documentation
- [ ] Create admin user guide (`docs/ADMIN_GUIDE.md`)
  - [ ] How to sign in
  - [ ] How to manage bookings
  - [ ] How to create events
  - [ ] How to manage users
  - [ ] How to update content
- [ ] Document environment variables (`docs/ENV_VARIABLES.md`)
  - [ ] Required variables
  - [ ] Optional variables
  - [ ] How to generate secrets
- [ ] Document deployment process (`docs/DEPLOYMENT.md`)
  - [ ] Database setup
  - [ ] Vercel deployment
  - [ ] Environment configuration
  - [ ] Post-deployment checks
- [ ] Add inline code comments to complex logic

### 44. Performance Optimization
- [ ] Optimize database queries
  - [ ] Add indexes (already in schema)
  - [ ] Use `select` to fetch only needed fields
  - [ ] Implement pagination for large lists
- [ ] Implement caching
  - [ ] Use `revalidate` for static data
  - [ ] Cache content sections
  - [ ] Cache dashboard stats
- [ ] Optimize images
  - [ ] Use Next.js Image component
  - [ ] Set proper sizes and formats
  - [ ] Lazy load images
- [ ] Add loading skeletons
  - [ ] Dashboard stats
  - [ ] Data tables
  - [ ] Content sections
- [ ] Implement lazy loading
  - [ ] Dynamic imports for heavy components
  - [ ] Code split admin routes

### 45. Final Deployment
- [ ] Deploy to Vercel
  - [ ] Connect GitHub repository
  - [ ] Configure build settings
  - [ ] Set environment variables
  - [ ] Deploy
- [ ] Test all features in production
  - [ ] Authentication
  - [ ] Bookings workflow
  - [ ] Events management
  - [ ] User management
  - [ ] Content updates
  - [ ] Email notifications
- [ ] Monitor error logs (Vercel dashboard)
- [ ] Set up analytics (Vercel Analytics already installed)
- [ ] Set up uptime monitoring (optional: UptimeRobot)

**Deliverables:**
- ✅ Production database setup
- ✅ Application deployed
- ✅ All features tested
- ✅ Documentation complete

---

## Priority Order

### **Critical Path (Must Complete in Order)**

**Week 1: Foundation**
1. Phase 1: Foundation & Setup
2. Phase 2: Server Actions Foundation
3. Phase 3: Admin Layout & UI
4. Phase 4: Admin Dashboard Page

**Week 2: Core Features**
5. Phase 5: Bookings Management
6. Phase 6: Events Management

**Week 3: Additional Features**
7. Phase 7: User Management
8. Phase 9: Additional Features (DataTable, Audit Logs, Settings)
9. Phase 10: Update Existing Components

**Week 4: Polish & Launch**
10. Phase 8: Content Management System
11. Phase 11: Testing & Quality Assurance
12. Phase 12: Deployment & Documentation

---

## Estimated Timeline

- **Phase 1 (Foundation):** 3 days
- **Phase 2 (Server Actions):** 2 days
- **Phase 3 (Layout):** 2 days
- **Phase 4 (Dashboard):** 1 day
- **Phase 5 (Bookings):** 3 days
- **Phase 6 (Events):** 3 days
- **Phase 7 (Users):** 2 days
- **Phase 8 (CMS):** 3 days
- **Phase 9 (Additional):** 2 days
- **Phase 10 (Integration):** 2 days
- **Phase 11 (Testing):** 3 days
- **Phase 12 (Deployment):** 2 days

**Total Estimated Time:** 28 days (4 weeks)

---

## Architecture Best Practices

### Server Actions
- ✅ Always authenticate at the start
- ✅ Validate inputs with Zod
- ✅ Use try-catch for error handling
- ✅ Call `revalidatePath()` after mutations
- ✅ Log important actions to audit trail
- ✅ Return consistent `{ success, data, error }` format

### Database
- ✅ Use indexes for frequently queried fields
- ✅ Use `select` to fetch only needed fields
- ✅ Implement pagination for large datasets
- ✅ Use transactions for multi-step operations
- ✅ Enable connection pooling (Prisma)

### Security
- ✅ Middleware protects all admin routes
- ✅ Server actions check auth and role
- ✅ All inputs validated on client AND server
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ Audit logging for sensitive actions
- ✅ Rate limiting on auth endpoints (optional)

### Performance
- ✅ Server Components by default
- ✅ Client Components only when needed
- ✅ Dynamic imports for heavy components
- ✅ Optimize images with Next.js Image
- ✅ Cache static data with `revalidate`
- ✅ Loading skeletons for better UX

### UX
- ✅ Consistent neon theme throughout
- ✅ Responsive design (mobile-first)
- ✅ Loading states for all async operations
- ✅ Toast notifications for feedback
- ✅ Confirmation dialogs for destructive actions
- ✅ Error boundaries for graceful failures

---

## Dependencies Reference

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta",
    "@prisma/client": "latest",
    "prisma": "latest",
    "bcryptjs": "^2.4.3",
    "@tanstack/react-table": "^8.11.0",
    "uploadthing": "latest",
    "@uploadthing/react": "latest",
    "resend": "^3.0.0",
    "react-email": "^2.0.0",
    "@react-email/components": "latest",
    "date-fns": "^3.0.0",
    "react-day-picker": "^8.10.0",
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

---

## Success Metrics

### Functionality ✅
- [ ] All CRUD operations working
- [ ] Email notifications delivering
- [ ] File uploads successful
- [ ] Authentication secure and reliable

### Performance 📊
- [ ] Lighthouse score: 95+
- [ ] Database queries: < 200ms average
- [ ] Page load time: < 2s
- [ ] Time to Interactive: < 3s

### Security 🔒
- [ ] All admin routes protected
- [ ] All inputs validated
- [ ] Audit logs complete
- [ ] No security vulnerabilities (npm audit)
- [ ] Rate limiting active on auth

### User Experience 🎨
- [ ] Responsive on all devices
- [ ] Intuitive navigation
- [ ] Consistent design language
- [ ] Helpful error messages
- [ ] Smooth animations and transitions

---

## Support & Resources

### Official Documentation
- [Next.js 16](https://nextjs.org/docs)
- [NextAuth v5](https://authjs.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Resend](https://resend.com/docs)
- [Uploadthing](https://docs.uploadthing.com/)
- [Zod](https://zod.dev/)
- [TanStack Table](https://tanstack.com/table/latest)

### Community
- Next.js Discord
- Prisma Discord
- Stack Overflow

---

**Last Updated:** 2025-11-18
**Version:** 2.0 (Updated with Modern Architecture)
**Status:** Ready for Implementation
**See Also:** `docs/BACKEND_MIGRATION_PLAN.md` for detailed implementation guide
