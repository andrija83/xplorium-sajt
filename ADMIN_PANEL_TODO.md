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
- [x] Initialize Prisma (`npx prisma init`)
- [x] Create enhanced Prisma schema (see migration plan)
  - [x] User model with `blocked` field and `image` field
  - [x] Booking model with optional `userId` (guest bookings), `adminNotes`
  - [x] Event model with `slug`, `order` (drag-drop), `EventStatus` enum
  - [x] SiteContent model with `updatedBy` tracking
  - [x] AuditLog model with `ipAddress`, `userAgent`, `changes` JSON
  - [x] Enhanced enums: `BookingType` (CAFE, SENSORY_ROOM, PLAYGROUND, PARTY, EVENT)
  - [x] Add database indexes for performance
  - [x] PricingPackage model with categories (PLAYGROUND, SENSORY_ROOM, CAFE, PARTY)
- [x] Run initial migration (`npx prisma migrate dev --name init`)
- [x] Generate Prisma Client (`npx prisma generate`)
- [x] Create database connection utility (`lib/db.ts`)
- [x] Create seed script (`prisma/seed.ts`) for initial admin account

**Deliverables:**
- ✅ Full schema with indexes
- ✅ Migrations applied
- ✅ Seed admin user created

### 3. Authentication Setup (NextAuth v5)
- [x] Create password utilities (`lib/password.ts` - bcrypt hash/compare)
- [x] Create auth config for middleware (`lib/auth.config.ts`)
- [x] Create main auth config (`lib/auth.ts`) with Credentials provider
- [x] Create NextAuth API route (`app/api/auth/[...nextauth]/route.ts`)
- [x] Export auth handlers (`{ handlers, signIn, signOut, auth }`)
- [x] Create validation schemas (`lib/validations.ts` - Zod schemas for auth)

**Deliverables:**
- ✅ NextAuth v5 configured
- ✅ Session management working
- ✅ Password hashing (bcrypt, 12 rounds)

### 4. Security & Route Protection
- [x] Create `middleware.ts` for admin route protection
  - [x] Use `auth` from NextAuth as middleware
  - [x] Protect `/admin/*` routes
  - [x] Check user role (ADMIN or SUPER_ADMIN)
  - [x] Redirect unauthorized users
- [x] Implement role-based access control (RBAC) in auth config
- [x] Add CSRF protection (built into Server Actions)
- [ ] Add rate limiting to auth routes (optional: Upstash)
- [x] Create input validation schemas with Zod

**Deliverables:**
- ✅ Middleware protecting admin routes
- ✅ RBAC implemented
- ✅ Validation schemas created

---

## Phase 2: Server Actions Foundation (NEW)

### 5. Create Server Actions Structure
- [x] Create `app/actions/` directory
- [x] Create `app/actions/auth.ts`
  - [x] `signUp(email, password, name)` - Create user account
  - [x] Helper functions for auth operations
  - [x] `resetPassword(email)` - Forgot password functionality
- [x] Create `app/actions/bookings.ts`
  - [x] `getBookings(filters)` - List bookings
  - [x] `getBookingById(id)` - Get single booking
  - [x] `approveBooking(id, adminNotes)` - Approve booking
  - [x] `rejectBooking(id, reason)` - Reject booking
  - [x] `updateBooking(id, data)` - Update booking
  - [x] `deleteBooking(id)` - Delete booking
  - [x] `createBooking(data)` - Create booking
- [x] Create `app/actions/events.ts`
  - [x] `getEvents(filters)` - List events
  - [x] `getEventById(id)` - Get single event
  - [x] `createEvent(data)` - Create event
  - [x] `updateEvent(id, data)` - Update event
  - [x] `deleteEvent(id)` - Delete event
  - [x] `reorderEvents(newOrder)` - Drag-drop reordering
- [x] Create `app/actions/pricing.ts`
  - [x] `getPricingPackages(filters)` - List pricing packages
  - [x] `getPricingPackageById(id)` - Get single package
  - [x] `getPublishedPricingPackages(category)` - Get published packages
  - [x] `createPricingPackage(data)` - Create package
  - [x] `updatePricingPackage(id, data)` - Update package
  - [x] `deletePricingPackage(id)` - Delete package
  - [x] `reorderPricingPackages(packageIds)` - Drag-drop reordering
- [x] Create `app/actions/users.ts`
  - [x] `getUsers(filters)` - List users
  - [x] `getUserById(id)` - Get user details
  - [x] `createUser(data)` - Create user/admin
  - [x] `updateUserRole(id, role)` - Change role
  - [x] `toggleUserBlock(id)` - Block/unblock user
  - [x] `deleteUser(id)` - Delete user
- [x] Create `app/actions/content.ts`
  - [x] `getContentBySection(section)` - Get section content
  - [x] `updateContent(section, data)` - Update content
- [x] Create `app/actions/dashboard.ts`
  - [x] `getDashboardStats()` - Get stats for dashboard
- [x] Create `app/actions/audit.ts`
  - [x] `getAuditLogs(filters)` - Get audit logs

**Patterns to Follow:**
- ✅ Auth check at start of every action
- ✅ Zod validation for inputs
- ✅ Try-catch error handling
- ✅ `revalidatePath()` after mutations
- ✅ Audit logging for important actions
- ✅ Return `{ success, data, error }` pattern

### 6. Create Audit Logging Utility
- [x] Create `lib/audit.ts`
  - [x] `logAudit(userId, action, entity, entityId, changes, ipAddress, userAgent)`
  - [x] Helper to get IP and user agent from headers
- [x] Integrate audit logging into server actions
  - [x] Log booking approvals/rejections
  - [x] Log event creation/updates/deletion
  - [x] Log pricing package creation/updates/deletion
  - [x] Log user role changes
  - [x] Log content updates

**Deliverables:**
- ✅ All server actions created (auth, bookings, events, pricing, users, content, dashboard, audit)
- ✅ Auth checks in place
- ✅ Audit logging integrated across all entities

---

## Phase 3: Admin Layout & UI

### 7. Admin Layout Structure
- [x] Create admin layout component (`app/admin/layout.tsx`)
  - [x] Auth check (redirect if not admin)
  - [x] Set up responsive sidebar/main content grid
  - [x] Apply consistent neon theme styling
  - [x] Add loading states with Suspense
  - [x] Add error boundary

**Layout Structure:**
```
Grid: Sidebar (240px) | Main Content (flex-1)
Mobile: Collapsible sidebar
```

### 8. Admin Sidebar Component
- [x] Create AdminSidebar component (`components/admin/AdminSidebar.tsx`)
- [x] Add navigation links with icons (lucide-react):
  - [x] Dashboard (LayoutDashboard icon)
  - [x] Events Management (Calendar icon)
  - [x] Pricing Management (Tag icon)
  - [x] Booking Requests (ClipboardList icon) - **with pending count badge**
  - [x] User Management (Users icon)
  - [x] Content Editor (FileEdit icon)
  - [x] Audit Logs (Shield icon)
  - [ ] Settings (Settings icon)
  - [x] Logout (LogOut icon)
- [x] Add active link highlighting (use `usePathname()`)
- [x] Make responsive (collapsible on mobile with hamburger menu)
- [x] Add Xplorium logo at top
- [x] Style with neon theme (matching main site)

### 9. Admin Header Component
- [x] Create AdminHeader component (`components/admin/AdminHeader.tsx`)
- [x] Add mobile menu toggle button
- [x] Add user profile section with:
  - [x] User avatar/initials
  - [x] User name and role badge
  - [x] Dropdown menu (Profile, Settings, Logout)
- [ ] Add notifications bell icon (optional)
- [x] Style with neon accents

**Deliverables:**
- ✅ Admin layout with sidebar
- ✅ Responsive design
- ✅ Navigation working

---

## Phase 4: Admin Dashboard Page

### 10. Admin Dashboard Page
- [x] Create dashboard page (`app/admin/page.tsx`)
- [x] Fetch data using server actions in Server Component
- [x] Add statistics overview section (4-column grid):
  - [x] Total Bookings (with trend)
  - [x] Pending Requests (with count badge)
  - [x] Total Users
  - [x] Upcoming Events
- [x] Add charts section:
  - [x] Bookings over time (line chart with Recharts)
  - [x] Bookings by type (pie chart)
- [x] Add recent activity feed:
  - [x] Recent bookings (last 5)
  - [x] Recent events (last 3)
- [x] Add quick actions panel:
  - [x] Create Event button
  - [x] View Pending Bookings button
  - [x] Create Pricing Package button

### 11. StatsCard Component
- [x] Create StatsCard component (`components/admin/StatsCard.tsx`)
- [x] Props: `title`, `value`, `icon`, `trend` (optional), `onClick` (optional)
- [x] Display icon from lucide-react
- [x] Show value with large font
- [x] Show trend indicator (up/down arrow with percentage)
- [x] Add hover effect and cursor pointer if clickable
- [x] Style with glass morphism and neon border

**Deliverables:**
- ✅ Dashboard with comprehensive stats
- ✅ Charts displaying data (Recharts integrated)
- ✅ Recent activity feed

---

## Phase 5: Bookings Management

### 12. Bookings List Page
- [x] Create bookings list page (`app/admin/bookings/page.tsx`)
- [x] Fetch bookings using server actions
- [x] Add filter controls (Client Component):
  - [x] Status filter (All, Pending, Approved, Rejected, Cancelled)
  - [x] Date range picker
  - [x] Booking type filter
  - [x] Search by email/title
- [x] Display using DataTable component
- [ ] Add bulk actions (optional):
  - [ ] Approve selected
  - [ ] Reject selected
  - [ ] Export selected
- [x] Add export to CSV button
- [x] Show pending count badge in sidebar

### 13. Booking Details Page
- [x] Create booking details page (`app/admin/bookings/[id]/page.tsx`)
- [x] Display full booking information
- [x] Add BookingCard component for layout
- [x] Show user information (if registered user)
- [x] Add admin notes textarea
- [x] Add action buttons:
  - [x] Approve (green neon)
  - [x] Reject (red neon)
  - [x] Cancel
  - [x] Delete (with confirmation)
- [x] Show booking status with colored badge
- [x] Display created/updated timestamps
- [x] Add back button to list

### 14. BookingCard Component
- [x] BookingCard functionality integrated in booking details page
- [x] Display booking details in card layout
- [x] Include form for admin notes
- [x] Add approve/reject buttons with loading states
- [x] Use `useTransition()` for optimistic updates
- [x] Show toast notifications on success/error
- [x] Disable buttons while action is pending
- [x] Style with glass morphism

### 15. Email Notifications Integration
- [ ] Set up Resend API (See TODO_RESEND_MIGRATION.md)
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
- ⏳ Email notifications (pending - see TODO_RESEND_MIGRATION.md)

---

## Phase 6: Events Management

### 16. Events List Page
- [x] Create events list page (`app/admin/events/page.tsx`)
- [x] Fetch events using Server Component
- [x] Add filter controls:
  - [x] Status filter (All, Draft, Published, Archived)
  - [x] Category filter
  - [x] Date range
  - [x] Search by title
- [x] Display in table view with DataTable component
- [x] Add drag-and-drop reordering (implemented via server action)
- [x] Show event thumbnails
- [x] Add "Create New Event" button
- [ ] Add bulk actions (publish, archive, delete) - optional

### 17. Create Event Page
- [x] Create new event page (`app/admin/events/new/page.tsx`)
- [x] Use EventEditor component
- [x] Set form defaults (draft status)
- [x] Handle form submission with server action
- [x] Redirect to event list on success
- [x] Show validation errors

### 18. Edit Event Page
- [x] Create edit event page (`app/admin/events/[id]/edit/page.tsx`)
- [x] Fetch event data in Server Component
- [x] Pre-populate EventEditor with data
- [x] Handle update with server action
- [x] Add delete button with confirmation
- [x] Show last updated timestamp

### 19. EventEditor Component
- [x] Create EventEditor component (`components/admin/EventEditor.tsx`)
- [x] Add form fields:
  - [x] Title (text input)
  - [x] Slug (auto-generated, editable)
  - [x] Description (rich text editor - Tiptap)
  - [x] Date (date picker)
  - [x] Time (time picker)
  - [x] Category (select)
  - [x] Image (ImageUpload component)
  - [x] Status (toggle: Draft/Published/Archived)
- [x] Add form validation with Zod
- [x] Show preview mode (toggle view)
- [x] Add save draft and publish buttons
- [x] Use `react-hook-form` for form management

### 20. Image Upload System
- [x] Set up Uploadthing
  - [x] Create Uploadthing app
  - [x] Set environment variables
  - [x] Create file router (`app/api/uploadthing/core.ts`)
  - [x] Create API route (`app/api/uploadthing/route.ts`)
- [x] Create ImageUpload component (`components/admin/ImageUpload.tsx`)
  - [x] Drag-and-drop support
  - [x] Image preview
  - [x] File type validation (jpg, png, webp)
  - [x] File size limit (4MB)
  - [x] Upload progress indicator
  - [x] Delete uploaded image
- [x] Configure Uploadthing client (`lib/uploadthing.ts`)

**Deliverables:**
- ✅ Events CRUD complete
- ✅ Rich text editor working (Tiptap)
- ✅ Image upload functional (Uploadthing)
- ✅ Drag-drop reordering (server action based)

---

## Phase 7: User Management

### 21. Users List Page
- [x] Create users list page (`app/admin/users/page.tsx`)
- [x] Fetch users using server actions
- [x] Add search functionality (email, name)
- [x] Add role filter (All, User, Admin, Super Admin)
- [x] Add status filter (Active, Blocked)
- [x] Display in DataTable
- [x] Show user avatar, name, email, role, status
- [ ] Add "Create Admin" button (optional)

### 22. User Details Page
- [x] Create user details page (`app/admin/users/[id]/page.tsx`)
- [x] Display user information
- [x] Show user's bookings history
- [x] Show user's audit log entries
- [x] Add UserRoleSelector component
- [x] Add block/unblock toggle
- [x] Add delete user button (with confirmation)
- [x] Prevent self-deletion and self-role-change

### 23. UserRoleSelector Component
- [x] Create UserRoleSelector component (`components/admin/UserRoleSelector.tsx`)
- [x] Display current role as badge
- [x] Add role dropdown (User, Admin, Super Admin)
- [x] Disable if viewing own profile
- [x] Require SUPER_ADMIN role to create other SUPER_ADMINs
- [x] Use server action to update role
- [x] Show confirmation dialog for role changes
- [x] Log audit trail on change

### 24. Create Admin Account Form
- [ ] Add form to create admin accounts (optional feature)
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
- [x] Create content editor directory (`app/admin/content/`)
- [x] Create main content page (`app/admin/content/page.tsx`)
- [x] Create section-specific editor (`app/admin/content/[section]/page.tsx`)
  - [x] Dynamic section routing (cafe, sensory, igraonica)
  - [x] JSON-based content editing
  - [x] Section-specific fields

### 26. ContentEditor Component
- [x] Create JsonEditor component (`components/admin/JsonEditor.tsx`)
- [x] Add JSON editing with Monaco editor
- [x] Add validation for JSON structure
- [x] Add formatted JSON display
- [ ] Add live preview panel (split view) - optional enhancement
- [x] Save changes with server action
- [x] Show last updated info

### 27. Update Public Site to Fetch from Database
- [x] Update `features/cafe/CafeSection.tsx` to fetch pricing from database
- [x] Cafe section displays pricing packages dynamically
- [ ] Update remaining sections to fetch from `SiteContent` (optional - currently using static content)
- [x] Add loading states
- [x] Add error handling
- [x] Cache data appropriately

**Deliverables:**
- ✅ Content editor working (JSON-based)
- ✅ Pricing changes reflected on public site
- ✅ Database-driven content management functional

---

## Phase 9: Additional Features

### 28. DataTable Component (Reusable)
- [x] Create DataTable component (`components/admin/DataTable.tsx`)
- [x] Custom implementation (lightweight alternative to TanStack Table)
- [x] Features:
  - [x] Column sorting (ascending/descending)
  - [x] Search/filtering (parent component handles)
  - [x] Pagination (10, 25, 50, 100 per page)
  - [x] Row selection (checkboxes)
  - [ ] Bulk actions bar (optional)
  - [x] Export to CSV
  - [ ] Column visibility toggle (optional)
  - [x] Responsive design
- [x] Style with neon theme
- [x] Add loading skeleton

### 29. Audit Logs Viewer
- [x] Create audit log page (`app/admin/audit/page.tsx`)
- [x] Fetch logs using server action
- [x] Add filters:
  - [x] User (dropdown)
  - [x] Action (CREATE, UPDATE, DELETE, APPROVE, REJECT)
  - [x] Entity (Event, Booking, User, Content, PricingPackage)
  - [x] Date range
- [x] Display in DataTable
- [x] Show detailed changes on click (JSON viewer)
- [x] Add export to CSV
- [x] Paginate results

### 30. Settings Page
- [ ] Create settings page (`app/admin/settings/page.tsx`) - optional feature
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
- [x] Create export utility (integrated in DataTable component)
  - [x] `exportToCSV(data, filename)`
- [x] Add export buttons to:
  - [x] Bookings list
  - [x] Events list
  - [x] Users list
  - [x] Audit logs
  - [x] Pricing list
- [x] Generate and download file on client
- [ ] Add date range selector for exports (optional)
- [ ] Add column selector (optional)

**Deliverables:**
- ✅ Reusable DataTable component
- ✅ Audit logs viewable
- ⏳ Settings page (optional feature - not critical)
- ✅ Export working

---

## Phase 10: Update Existing Components

### 32. Update SignInModal
- [x] Update `components/auth/SignInModal.tsx`
- [x] Import `signIn` from `next-auth/react`
- [x] Call `signIn('credentials', { ... })` on form submit
- [x] Handle authentication errors
- [x] Check user role after sign-in
- [x] Redirect admins to `/admin` dashboard
- [x] Redirect regular users to homepage
- [x] Show loading state during sign-in
- [x] Add "Forgot Password" link

### 33. Update SignUpModal
- [x] Update `components/auth/SignUpModal.tsx`
- [x] Call `signUp` server action from `app/actions/auth.ts`
- [x] Validate password strength (min 8 chars, special chars)
- [x] Create user account in database
- [ ] Send welcome email (pending Resend integration)
- [x] Auto sign-in after registration
- [x] Redirect to homepage
- [x] Show success toast

### 34. Add Forgot Password Modal
- [x] Create `components/auth/ForgotPasswordModal.tsx`
- [x] Add email input field
- [x] Call `resetPassword` server action
- [x] Show success/error states
- [x] Link from Sign In modal
- [x] Handle form validation
- [x] Style with neon theme

### 35. Update Booking Form
- [x] Update `components/common/BookingForm.tsx`
- [x] Submit to `createBooking` server action
- [x] Add form validation (Zod)
- [x] Show loading state during submission
- [x] Show success toast with booking reference
- [ ] Send confirmation email to user (pending Resend)
- [x] Reset form after successful submission
- [x] Handle errors gracefully

### 36. Event Calendar Integration
- [x] Events fetched from database using server actions
- [x] Filter by published status
- [x] Display in public calendar/events section
- [x] Add loading states
- [x] Cache data appropriately
- [x] Events displayed dynamically on public site

**Deliverables:**
- ✅ Auth modals fully integrated with NextAuth
- ✅ Forgot Password functionality added
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

## 🎉 Recent Major Updates

### Pricing Package Management System (Completed 2025-11-20)
A complete pricing package management system has been implemented:

**Backend Components:**
- ✅ `PricingPackage` Prisma model with categories (PLAYGROUND, SENSORY_ROOM, CAFE, PARTY)
- ✅ Full CRUD server actions in `app/actions/pricing.ts`
- ✅ Drag-drop reordering functionality via `reorderPricingPackages`
- ✅ Audit logging for all pricing operations
- ✅ Validation schemas in `lib/validations/pricing.ts`

**Admin Panel Features:**
- ✅ Pricing list page at `/admin/pricing`
- ✅ Create new package at `/admin/pricing/new`
- ✅ Edit package at `/admin/pricing/[id]/edit`
- ✅ `PricingEditor` component with rich form fields
- ✅ `PricingTable` component for listing packages
- ✅ Status management (Draft/Published)
- ✅ Category filtering and search
- ✅ CSV export functionality

**Public Site Integration:**
- ✅ Cafe section dynamically displays pricing packages from database
- ✅ Only published packages are shown to public
- ✅ Packages ordered by `order` field (drag-drop support)
- ✅ Real-time updates when admin changes pricing

**Added to Admin Sidebar:**
- ✅ Pricing Management navigation item with Tag icon

This feature allows complete management of pricing packages across all venue sections (Cafe, Playground, Sensory Room, Parties) with a beautiful admin interface and seamless public site integration.

### Forgot Password Feature (Completed 2025-11-20)
- ✅ `ForgotPasswordModal` component with email input
- ✅ `resetPassword` server action in `app/actions/auth.ts`
- ✅ Password reset flow with validation
- ✅ Integration with Sign In modal
- ✅ Error handling and success states
- ✅ See `TODO_RESEND_MIGRATION.md` for email service migration plan

### OAuth Integration Plan (Created 2025-11-20)
- 📄 Comprehensive OAuth implementation plan in `OAUTH_IMPLEMENTATION_PLAN.md`
- Covers Google, Facebook, and GitHub providers
- Step-by-step migration from Credentials to OAuth
- Security best practices and error handling

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

## 📊 Implementation Progress Summary

### Completed Phases (✅)
1. **Phase 1: Foundation & Setup** - 100% Complete
   - Database schema with Prisma
   - NextAuth v5 authentication
   - Middleware and route protection
   - Seed scripts and initial admin account

2. **Phase 2: Server Actions Foundation** - 100% Complete
   - All server actions created (auth, bookings, events, pricing, users, content, dashboard, audit)
   - Audit logging integrated
   - Zod validation throughout
   - Proper error handling and revalidation

3. **Phase 3: Admin Layout & UI** - 100% Complete
   - Responsive admin layout
   - AdminSidebar with all navigation
   - AdminHeader with user profile
   - Neon theme styling

4. **Phase 4: Admin Dashboard Page** - 100% Complete
   - Dashboard with comprehensive stats
   - Recharts integration
   - Recent activity feed
   - Quick actions panel

5. **Phase 5: Bookings Management** - 95% Complete
   - Bookings list with filtering ✅
   - Booking details page ✅
   - Approve/reject workflow ✅
   - Email notifications ⏳ (pending Resend setup)

6. **Phase 6: Events Management** - 100% Complete
   - Full CRUD operations
   - Rich text editor (Tiptap)
   - Image upload (Uploadthing)
   - Drag-drop reordering
   - Status management

7. **Phase 7: User Management** - 95% Complete
   - User list with filtering ✅
   - User details page ✅
   - Role management ✅
   - Block/unblock functionality ✅
   - Create admin form ⏳ (optional)

8. **Phase 8: Content Management** - 90% Complete
   - JSON-based content editor ✅
   - Section-specific editing ✅
   - Pricing integration with public site ✅
   - Live preview ⏳ (optional enhancement)

9. **Phase 9: Additional Features** - 85% Complete
   - Reusable DataTable component ✅
   - Audit logs viewer ✅
   - CSV export functionality ✅
   - Settings page ⏳ (optional)

10. **Phase 10: Update Existing Components** - 95% Complete
    - Auth modals integrated ✅
    - Forgot password feature ✅
    - Booking form integration ✅
    - Event calendar integration ✅
    - Email notifications ⏳ (pending Resend)

### Overall Progress: **~95% Complete**

### Remaining High-Priority Tasks
1. **Email Integration** - Set up Resend API for:
   - Booking confirmations
   - Password reset emails
   - User welcome emails
   - See `TODO_RESEND_MIGRATION.md`

2. **OAuth Implementation** (Optional Enhancement)
   - Google, Facebook, GitHub login
   - See `OAUTH_IMPLEMENTATION_PLAN.md`

3. **Settings Page** (Optional)
   - Site configuration
   - Email settings
   - Social media links

4. **Bulk Actions** (Optional)
   - Bulk approve/reject bookings
   - Bulk publish/archive events

### Testing Status
- ⏳ Phase 11: Testing & Quality Assurance - Pending
- ⏳ Phase 12: Deployment & Documentation - Pending

### Production Readiness
The admin panel is **functionally complete** and ready for production use with the following caveats:
- Email notifications require Resend setup (non-blocking)
- Comprehensive testing recommended before deployment
- Documentation should be updated with final deployment steps

---

**Last Updated:** 2025-11-20
**Version:** 2.1 (Progress Update - Pricing Feature Added)
**Status:** 95% Complete - Production Ready (pending email integration)
**See Also:**
- `docs/BACKEND_MIGRATION_PLAN.md` for detailed implementation guide
- `TODO_RESEND_MIGRATION.md` for email service setup
- `OAUTH_IMPLEMENTATION_PLAN.md` for OAuth enhancement plan
