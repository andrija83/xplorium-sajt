# Xplorium User Guide

## Table of Contents

1. [For Visitors (Public Users)](#for-visitors-public-users)
2. [For Registered Users](#for-registered-users)
3. [For Administrators](#for-administrators)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Troubleshooting](#troubleshooting)

---

## For Visitors (Public Users)

### Landing Page Navigation

#### Step 1: Welcome Screen
When you first visit Xplorium, you'll see:
- **Animated starfield background** - Twinkling stars in space
- **X logo** in the center - The entry point to explore

**How to proceed:**
- **Click** the X logo
- **Or press Enter/Space** while focused on the logo

#### Step 2: Brand Reveal
After clicking the X logo:
1. The X logo **rotates and shrinks**
2. The brand name "**Xplorium**" appears with animation
3. Three main section buttons appear:
   - **Cafe** (cyan color)
   - **Sensory** (purple color)
   - **Igraonica** (pink color)

#### Step 3: Explore Sections

##### 🍽️ **Cafe Section** (Cyan)
Click the "Cafe" button to explore our cafe offerings.

**Submenu options:**
- **Meni** - View our full menu
- **Radno Vreme** - Check opening hours
- **Kontakt** - Contact information and location
- **Cenovnik** - Pricing and packages

**Navigation:**
- Click any submenu item to see details
- Press **Escape** to go back to the main menu
- Click the **back arrow** (top-left) to return

##### 🎨 **Sensory Section** (Purple)
Click the "Sensory" button to explore our sensory room.

**You'll see 3 floating planet orbs:**
- **Floor** - Interactive floor projections
- **Wall** - Wall-mounted sensory activities
- **Ceiling** - Overhead sensory experiences

**How to interact:**
- **Click** any planet orb to learn about that sensory feature
- **Hover** over orbs to see them glow
- Press **Escape** to return to planets view
- Press **Escape** again to return to main menu

##### 🎪 **Igraonica Section** (Pink - Playground)
Click the "Igraonica" button to explore our interactive playground.

**What you'll see:**
- Description with typewriter animation
- Details about playground features
- Safety information
- Age recommendations

**Navigation:**
- Press **Escape** to return to main menu
- Click the **back arrow** to return

### Authentication (Sign In / Sign Up)

Located in the **top-right corner** of every page.

#### Sign In
1. Click **"Sign In"** button
2. Modal opens with form:
   - **Email** - Enter your email address
   - **Password** - Enter your password
3. Click **"Sign In"** button in the modal
4. If you forgot your password, click **"Forgot Password?"**

**Alternative:**
- Click **"Don't have an account? Sign Up"** to create a new account

#### Sign Up
1. Click **"Sign Up"** button
2. Modal opens with form:
   - **Name** - Your full name
   - **Email** - Valid email address
   - **Password** - Must be at least 8 characters
3. Click **"Sign Up"** button in the modal

**After successful sign up/sign in:**
- You'll see your **profile button** in the top-right
- The **Sign In/Sign Up** buttons are replaced with **Profile** and **Sign Out**

### Closing Modals

**Three ways to close any modal:**
1. Click the **X** (close button) in the top-right of the modal
2. Press the **Escape** key
3. Click outside the modal (on the dark backdrop)

---

## For Registered Users

Once signed in, you have access to additional features:

### Profile Page

**Access your profile:**
- Click your **profile picture/name** in the top-right corner
- Or click **"Profile"** button if visible

**What you can do:**
- View your account information
- Update your profile details
- Change your password
- View your booking history (when implemented)
- Manage your preferences

### Booking System (Coming Soon)
- Book playground sessions
- Reserve sensory room time
- Order cafe items in advance
- View upcoming reservations

### Sign Out

**To sign out:**
1. Click **"Sign Out"** button in the top-right corner
2. Animation plays:
   - X logo appears
   - X logo rotates and fades out
   - Page refreshes automatically
3. You're returned to the welcome screen

---

## For Administrators

Administrators have access to a comprehensive admin panel for managing the entire Xplorium platform.

### Accessing Admin Panel

**Requirements:**
- Must have **ADMIN** or **SUPER_ADMIN** role
- Must be signed in

**How to access:**
1. Sign in with admin credentials
2. Navigate to: `https://yourdomain.com/admin`
3. Or click **"Admin"** link if visible in navigation

**Security:**
- Admin pages are protected by middleware
- Non-admin users are redirected automatically
- Admin sessions timeout after **30 minutes of inactivity**

### Admin Dashboard

**URL:** `/admin` or `/admin/dashboard`

**Overview section shows:**
- **Total Users** - Number of registered users
- **Active Bookings** - Current reservations
- **Events This Month** - Upcoming events count
- **Revenue This Month** - Financial overview

**Quick actions:**
- View recent activity
- Access key management areas
- See important notifications

### User Management

**URL:** `/admin/users`

**What you can do:**
- **View all users** - Paginated list with search
- **Create new user** - Add users manually
- **Edit user details** - Name, email, role
- **Change user roles** - USER, ADMIN, SUPER_ADMIN
- **Block/Unblock users** - Prevent access
- **Delete users** - Remove accounts (with confirmation)

**How to manage users:**

#### Create New User
1. Click **"Add User"** or **"Create User"** button
2. Fill in the form:
   - Name
   - Email
   - Password (optional - can be auto-generated)
   - Role (USER, ADMIN, SUPER_ADMIN)
3. Click **"Create"** or **"Submit"**
4. Success message appears

#### Edit User
1. Find the user in the list
2. Click **"Edit"** button (pencil icon)
3. Modal opens with user details
4. Update fields as needed
5. Click **"Save"** or **"Update"**

#### Change User Role
1. Click **"Edit"** on the user
2. Select new role from dropdown
3. Click **"Save"**
4. User's permissions update immediately

#### Block User
1. Find the user in the list
2. Click **"Block"** button
3. Confirm the action
4. User cannot sign in until unblocked

#### Delete User
1. Click **"Delete"** button (trash icon)
2. Confirmation dialog appears
3. Confirm deletion
4. User is permanently removed

**Search & Filter:**
- Use the **search bar** to find users by name or email
- Filter by role (All, Users, Admins)
- Sort by name, email, or date joined

### Event Management

**URL:** `/admin/events`

**What you can do:**
- **Create events** - Add new events/activities
- **Edit events** - Update event details
- **Publish/Unpublish** - Control visibility
- **Delete events** - Remove old events
- **Reorder events** - Change display order

**How to manage events:**

#### Create New Event
1. Click **"Add Event"** or **"Create Event"**
2. Fill in the form:
   - **Title** - Event name
   - **Description** - Full details
   - **Date & Time** - When it happens
   - **Location** - Where (Cafe, Sensory, Playground)
   - **Capacity** - Maximum attendees
   - **Price** - Cost per person
   - **Image** - Upload event photo
3. Click **"Create"** or **"Publish"**

#### Edit Event
1. Find event in the list
2. Click **"Edit"** button
3. Update any fields
4. Click **"Save"**

#### Publish/Unpublish Event
1. Find event in the list
2. Toggle the **"Published"** switch
3. Published events are visible to users
4. Unpublished events are hidden

#### Reorder Events
1. Find the drag handle (⋮⋮ icon) on events
2. Click and drag to reorder
3. Order is saved automatically
4. Events display in new order on frontend

### Booking Management

**URL:** `/admin/bookings`

**What you can do:**
- **View all bookings** - See all reservations
- **Filter by status** - Pending, Approved, Rejected
- **Approve bookings** - Accept reservations
- **Reject bookings** - Decline reservations
- **Delete bookings** - Remove old bookings
- **View booking details** - See full information

**Booking statuses:**
- **Pending** - Awaiting approval
- **Approved** - Confirmed reservation
- **Rejected** - Declined by admin
- **Completed** - Past booking

**How to manage bookings:**

#### Approve Booking
1. Find pending booking
2. Click **"Approve"** button
3. Confirm action
4. User receives notification (if implemented)

#### Reject Booking
1. Find pending booking
2. Click **"Reject"** button
3. Optionally add rejection reason
4. Confirm action

#### View Booking Details
1. Click **"View"** or **"Details"** button
2. Modal shows:
   - Customer information
   - Date and time
   - Selected services
   - Payment status
   - Special requests

### Content Management

**URL:** `/admin/content`

**What you can do:**
- **Edit section content** - Update Cafe, Sensory, Igraonica text
- **Upload images** - Change section photos
- **Update descriptions** - Modify text content
- **Reorder sections** - Change layout

**How to edit content:**

#### Edit Cafe Section
1. Navigate to **Content** page
2. Find **Cafe** section
3. Click **"Edit"** button
4. Update:
   - Menu items
   - Opening hours
   - Contact information
   - Description
5. Click **"Save"**

#### Edit Sensory Section
1. Find **Sensory** section
2. Click **"Edit"**
3. Update descriptions for:
   - Floor activities
   - Wall activities
   - Ceiling activities
4. Click **"Save"**

#### Upload Images
1. Find the image upload area
2. Click **"Upload"** or drag and drop
3. Select image file
4. Crop/resize if needed
5. Click **"Save"**

### Pricing Management

**URL:** `/admin/pricing`

**What you can do:**
- **Create pricing packages** - Add new packages
- **Edit prices** - Update costs
- **Delete packages** - Remove outdated pricing
- **Reorder packages** - Change display order

**How to manage pricing:**

#### Create Pricing Package
1. Click **"Add Package"** button
2. Fill in:
   - **Package Name** (e.g., "Family Fun Day")
   - **Description** - What's included
   - **Price** - Cost
   - **Features** - List of included items
3. Click **"Create"**

#### Edit Package
1. Find package in list
2. Click **"Edit"**
3. Update any fields
4. Click **"Save"**

### Inventory Management

**URL:** `/admin/inventory`

**What you can do:**
- **Track items** - Monitor stock levels
- **Add new items** - Register inventory
- **Update quantities** - Adjust stock
- **Low stock alerts** - Get notified
- **Delete items** - Remove discontinued items

### Maintenance Logs

**URL:** `/admin/maintenance`

**What you can do:**
- **Log maintenance** - Record repairs/checks
- **Schedule maintenance** - Plan future tasks
- **View history** - See past maintenance
- **Track equipment** - Monitor all equipment

**How to log maintenance:**

#### Create Maintenance Log
1. Click **"Add Log"** button
2. Fill in:
   - **Equipment/Area** - What was maintained
   - **Type** - Repair, Inspection, Cleaning
   - **Date** - When it happened
   - **Performed by** - Who did it
   - **Notes** - Details
   - **Cost** - If applicable
3. Click **"Save"**

### Audit Logs

**URL:** `/admin/audit`

**What you can see:**
- **All admin actions** - Complete history
- **User changes** - Who changed what
- **Timestamps** - When actions occurred
- **Action types** - CREATE, UPDATE, DELETE

**Filter options:**
- **By action type** - Filter by CREATE, UPDATE, DELETE
- **By user** - See specific admin's actions
- **By date range** - View specific time period
- **By entity** - Filter by Users, Events, Bookings, etc.

**Audit log entry shows:**
- **Action** - What was done (CREATE_USER, UPDATE_EVENT, etc.)
- **User** - Which admin performed the action
- **Timestamp** - When it happened
- **Details** - What changed (before/after values)
- **IP Address** - Where it came from

**Why audit logs are important:**
- **Security** - Track unauthorized access
- **Accountability** - Know who did what
- **Compliance** - Meet regulatory requirements
- **Troubleshooting** - Find when issues started

---

## Keyboard Shortcuts

### Global Shortcuts
- **Escape** - Go back to previous view / Close modal
- **Enter** - Activate focused button
- **Space** - Activate focused button
- **Tab** - Navigate to next interactive element
- **Shift + Tab** - Navigate to previous interactive element

### Navigation Shortcuts
- **Escape** (from subsection) → Back to section menu
- **Escape** (from section) → Back to main menu
- **Escape** (from modal) → Close modal

### Accessibility
- **Tab** - Navigate through interactive elements
- Focus indicators are visible for keyboard navigation
- All interactive elements are reachable via keyboard

---

## Troubleshooting

### Common Issues

#### "I can't see the navigation menu"
**Solution:** Click the X logo in the center of the screen to reveal the menu.

#### "Modal won't close"
**Try these:**
1. Press **Escape** key
2. Click the **X** button in the modal
3. Click outside the modal on the dark area
4. Refresh the page if stuck

#### "I forgot my password"
**Solution:**
1. Click **"Sign In"**
2. Click **"Forgot Password?"** link
3. Enter your email
4. Check your email for reset link
5. Follow instructions to reset

#### "Admin panel shows 403 error"
**Reasons:**
- You're not signed in → Sign in first
- You don't have admin role → Contact super admin
- Session expired → Sign in again

#### "Page is loading slowly"
**Tips:**
- Check your internet connection
- Clear browser cache
- Try different browser
- Disable browser extensions temporarily

#### "Animations are too fast/slow"
**Solution:**
- Animations respect your system's motion preferences
- On Windows: Settings → Accessibility → Visual effects
- On Mac: System Preferences → Accessibility → Display → Reduce motion

#### "I'm signed in but can't access my profile"
**Try:**
1. Refresh the page
2. Sign out and sign in again
3. Clear browser cookies
4. Contact support if issue persists

### Browser Compatibility

**Fully supported browsers:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Mobile browsers:**
- ✅ Safari iOS 14+
- ✅ Chrome Android
- ✅ Samsung Internet

### Getting Help

**For users:**
- Check this guide first
- Look for tooltips (hover over icons)
- Contact venue staff

**For administrators:**
- Review admin documentation
- Check audit logs for issues
- Contact technical support

---

## Tips & Best Practices

### For Users
1. **Explore with Escape** - Use Escape key to navigate back easily
2. **Bookmark favorite sections** - Save direct links to Cafe/Sensory/Playground
3. **Sign in for benefits** - Access booking system and profile features
4. **Enable notifications** - Get updates about events and bookings

### For Administrators
1. **Check audit logs daily** - Monitor for unusual activity
2. **Back up data regularly** - Ensure data safety
3. **Test changes on staging** - Verify updates before going live
4. **Keep software updated** - Apply security patches
5. **Document procedures** - Train new admins effectively
6. **Monitor system health** - Watch for performance issues
7. **Respond to bookings promptly** - Approve/reject within 24 hours
8. **Keep content fresh** - Update events and descriptions regularly

---

## Quick Reference

### User Actions
| Action | Location | Shortcut |
|--------|----------|----------|
| Open menu | Click X logo | Enter/Space |
| Go back | Back arrow / Escape | Escape |
| Sign in | Top-right corner | - |
| Close modal | X button | Escape |
| Navigate sections | Click section button | - |

### Admin Actions
| Action | Location | URL |
|--------|----------|-----|
| Dashboard | Admin panel | `/admin` |
| Manage users | Users page | `/admin/users` |
| Manage events | Events page | `/admin/events` |
| View bookings | Bookings page | `/admin/bookings` |
| Edit content | Content page | `/admin/content` |
| View audit logs | Audit page | `/admin/audit` |

---

## Support

**Need more help?**
- 📧 Email: support@xplorium.com
- 📞 Phone: +1 (XXX) XXX-XXXX
- 🕐 Hours: Monday-Friday, 9 AM - 5 PM

**Report a bug:**
- Include what you were doing
- Share screenshots if possible
- Note your browser and device
- Describe expected vs actual behavior

---

*Last updated: 2025*
*Version: 1.0*
