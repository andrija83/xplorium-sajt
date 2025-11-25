# Customer Database & CRM Implementation

**Date:** November 25, 2025
**Status:** 🚧 In Progress - Schema Ready, Migration Needed
**Feature:** Customer Database with CRM & Loyalty Program

---

## 📊 Overview

Implementing a comprehensive Customer Relationship Management (CRM) system for Xplorium, featuring customer profiles, contact history, loyalty program tracking, and email marketing list management.

---

## ✅ Completed So Far

### 1. Database Schema Design

Added `Customer` model to Prisma schema with comprehensive CRM fields:

**Customer Model Features:**
- Basic contact information (email, name, phone)
- Loyalty program (points, tier, total spent)
- Marketing preferences (email opt-in, SMS opt-in, preferred contact method)
- Customer segmentation (tags, preferred booking types)
- Automatic stats (total bookings, first/last booking dates)
- Admin notes for customer service

**Loyalty Tiers:**
- 🥉 **BRONZE** - 0-999 points (entry level)
- 🥈 **SILVER** - 1,000-2,999 points
- 🥇 **GOLD** - 3,000-5,999 points
- 💎 **PLATINUM** - 6,000+ points
- ⭐ **VIP** - Special tier for high-value customers (manual assignment)

**Enums Added:**
```prisma
enum LoyaltyTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  VIP
}

enum PreferredContact {
  EMAIL
  PHONE
  SMS
  ANY
}
```

### 2. Server Actions Created (`app/actions/customers.ts`)

Comprehensive API for customer management:

#### Customer Management
- `getCustomers()` - List all customers with filtering and pagination
- `getCustomerById()` - Get customer profile with full booking history
- `upsertCustomer()` - Create or update customer profile

#### Loyalty Program
- `updateLoyaltyPoints()` - Add/subtract points, auto-update tier
- Auto-tier promotion based on point thresholds

#### Customer Segmentation
- `addCustomerTag()` - Add tags for segmentation (e.g., "vip", "birthday-regular")
- `removeCustomerTag()` - Remove tags

#### Data Synchronization
- `syncCustomerData()` - Import customers from existing bookings
- Calculates stats: total bookings, first/last booking dates
- Links to user accounts when available

#### Marketing
- `getMarketingList()` - Generate targeted marketing lists
- Filters: loyalty tier, tags, minimum bookings
- Only includes customers who opted in

---

## 🚧 Pending Implementation (OVDE SAM STAO)

### Step 1: Run Database Migration

**IMPORTANT:** Before using the customer features, you must run the Prisma migration.

```bash
# Stop the dev server first
npx prisma migrate dev --name add-customer-model

# Or reset if needed
npx prisma migrate reset
npx prisma migrate dev
```

This will:
- Create the `Customer` table
- Add `LoyaltyTier` and `PreferredContact` enums
- Set up indexes for performance

### Step 2: Create Customer Management UI

**Needed Pages:**

1. **`/admin/customers`** - Customer list page
   - DataTable with filtering
   - Search by email/name/phone
   - Filter by loyalty tier, marketing opt-in
   - Click to view customer details
   - Export to CSV button
   - Sync button to import from bookings

2. **`/admin/customers/[id]`** - Customer detail page
   - Customer profile card
   - Edit contact information
   - Loyalty points display with tier badge
   - Add/remove loyalty points
   - Manage tags
   - Marketing preferences toggles
   - Admin notes editor
   - Full booking history table
   - Contact timeline

### Step 3: Add to Sidebar Navigation

Update `components/admin/AdminSidebar.tsx`:

```typescript
{
  label: "Customers",
  href: "/admin/customers",
  icon: UserCircle // or Users2
}
```

### Step 4: Integrate with Bookings

**Auto-create/update customers when bookings are created:**

In `app/actions/bookings.ts`, after creating a booking:

```typescript
// Create or update customer record
await prisma.customer.upsert({
  where: { email: booking.email },
  create: {
    email: booking.email,
    name: userData.name,
    phone: booking.phone,
    totalBookings: 1,
    firstBookingDate: new Date(),
    lastBookingDate: new Date(),
  },
  update: {
    totalBookings: { increment: 1 },
    lastBookingDate: new Date(),
    phone: booking.phone,
  },
})
```

### Step 5: Loyalty Points System

**Point Rules (to be defined):**
- Booking completed: +100 points
- Party booking: +200 points
- Referral: +50 points
- Birthday month: 2x points
- Review posted: +25 points

**Rewards (to be defined):**
- 500 points: Free beverage
- 1,000 points: 10% discount
- 2,500 points: Free party add-on
- 5,000 points: Private event hour

### Step 6: Email Marketing Features

**Create email marketing page** (`/admin/marketing`):
- Segment builder with filters
- Preview recipient list
- Email template editor
- Send test emails
- Schedule campaigns
- Track open/click rates

---

## 📁 Files Created

1. **Schema Changes:**
   - `prisma/schema.prisma` - Added Customer model and enums

2. **Server Actions:**
   - `app/actions/customers.ts` (485 lines) - Complete customer API

3. **Documentation:**
   - `docs/CUSTOMER_DATABASE_IMPLEMENTATION.md` - This file

---

## 🎨 Proposed UI Design

### Customer List Page

```
┌─────────────────────────────────────────────────┐
│ Customers Management              [Sync] [Export]│
├─────────────────────────────────────────────────┤
│ [Search...] [Tier ▾] [Marketing ▾]              │
├─────────────────────────────────────────────────┤
│ Email          Name      Tier     Bookings  Last │
│ john@email.com John Doe  🥇GOLD   12        Nov 20│
│ jane@email.com Jane Smith 🥈SILVER 8        Nov 15│
│ ...                                              │
└─────────────────────────────────────────────────┘
```

### Customer Detail Page

```
┌─────────────────────────────────────────────────┐
│ ← Back to Customers                             │
├─────────────────────────────────────────────────┤
│ 👤 John Doe                        [Edit]       │
│ john@email.com                                   │
│ +1234567890                                      │
├─────────────────────────────────────────────────┤
│ Loyalty Program                                  │
│ 🥇 GOLD TIER                                     │
│ 3,450 points              [+Points] [-Points]   │
├─────────────────────────────────────────────────┤
│ Tags: [vip] [birthday-regular] [+Add Tag]       │
├─────────────────────────────────────────────────┤
│ Marketing Preferences                            │
│ ☑ Email Marketing    ☐ SMS Marketing            │
│ Preferred Contact: Email                         │
├─────────────────────────────────────────────────┤
│ Statistics                                       │
│ Total Bookings: 12                               │
│ Total Spent: $1,450                              │
│ First Booking: Jan 15, 2024                      │
│ Last Booking: Nov 20, 2025                       │
├─────────────────────────────────────────────────┤
│ Booking History                                  │
│ Date       Type      Status    Amount            │
│ Nov 20     Party     Approved  $200              │
│ Oct 15     Cafe      Completed $45               │
│ ...                                              │
├─────────────────────────────────────────────────┤
│ Admin Notes                                      │
│ [Text editor for notes...]                       │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Technical Details

### Customer Data Model

```typescript
interface Customer {
  id: string

  // Contact
  email: string // unique
  name?: string
  phone?: string

  // Loyalty
  loyaltyPoints: number // default: 0
  loyaltyTier: LoyaltyTier // default: BRONZE
  totalSpent: number // default: 0

  // Preferences
  preferredContactMethod: PreferredContact
  marketingOptIn: boolean // default: true
  smsOptIn: boolean // default: false
  preferredTypes?: BookingType[] // JSON
  notes?: string // Admin notes

  // Segmentation
  tags: string[] // Array for flexible tagging

  // Stats (auto-calculated)
  totalBookings: number
  lastBookingDate?: Date
  firstBookingDate?: Date

  // Link to user account
  userId?: string // unique

  createdAt: Date
  updatedAt: Date
}
```

### Loyalty Tier Calculation

```typescript
function calculateTier(points: number): LoyaltyTier {
  if (points >= 6000) return 'PLATINUM'
  if (points >= 3000) return 'GOLD'
  if (points >= 1000) return 'SILVER'
  return 'BRONZE'
}
```

### Marketing List Generation

```typescript
// Example: Get VIP customers who book parties
const list = await getMarketingList({
  loyaltyTier: 'PLATINUM',
  tags: ['party-regular'],
  minBookings: 5,
})

// Returns: Array of customers with email, name, tier
// Only includes customers where marketingOptIn = true
```

---

## 📈 Business Value

### Immediate Benefits

1. **Customer Retention**
   - Loyalty program encourages repeat bookings
   - Tier system creates engagement goals
   - VIP treatment for best customers

2. **Targeted Marketing**
   - Segment customers by behavior
   - Email campaigns to specific groups
   - Personalized offers based on preferences

3. **Better Service**
   - Full customer history at a glance
   - Admin notes for special requirements
   - Preferred contact method tracking

4. **Data-Driven Decisions**
   - Identify most valuable customers
   - Track customer lifetime value
   - Analyze booking patterns

### Future Enhancements

1. **Automated Campaigns**
   - Birthday emails with special offers
   - Win-back campaigns for inactive customers
   - Tier upgrade congratulations

2. **Referral Program**
   - Track referrals
   - Reward both referrer and referee
   - Viral growth mechanics

3. **Advanced Segmentation**
   - RFM analysis (Recency, Frequency, Monetary)
   - Predictive churn modeling
   - Lifetime value calculation

4. **Customer Portal**
   - Customers view their own loyalty points
   - Redeem rewards online
   - Track booking history

---

## 🧪 Testing Plan

### Manual Testing Checklist

**After Migration:**
- [ ] Run `syncCustomerData()` to import existing customers
- [ ] Verify customer records created
- [ ] Check loyalty tiers calculated correctly
- [ ] Test marketing opt-in filtering
- [ ] Add loyalty points manually
- [ ] Verify tier auto-upgrade
- [ ] Add/remove tags
- [ ] Generate marketing list
- [ ] Export customer list to CSV
- [ ] Link customer to user account

**Integration Testing:**
- [ ] New booking creates/updates customer
- [ ] Booking completion awards loyalty points
- [ ] Customer stats update automatically
- [ ] Marketing preferences respected

### Test Data Requirements

For comprehensive testing:
- At least 50+ customers
- Various loyalty tiers (Bronze to VIP)
- Mix of marketing opt-in/opt-out
- Different booking patterns
- Some with tags, some without

---

## 🚀 Deployment Steps

### 1. Database Migration

```bash
# In development
npx prisma migrate dev --name add-customer-model

# In production (after testing)
npx prisma migrate deploy
```

### 2. Initial Data Import

```bash
# Run sync to import customers from existing bookings
# This can be done via admin UI or server action
await syncCustomerData()
```

### 3. Configuration

Define loyalty point rules in `constants/loyalty.ts`:

```typescript
export const LOYALTY_POINTS = {
  BOOKING_COMPLETED: 100,
  PARTY_BOOKING: 200,
  REFERRAL: 50,
  BIRTHDAY_BONUS_MULTIPLIER: 2,
  REVIEW_POSTED: 25,
}

export const LOYALTY_REWARDS = {
  500: { type: 'FREE_BEVERAGE', description: 'Free beverage of choice' },
  1000: { type: 'DISCOUNT_10', description: '10% off next booking' },
  2500: { type: 'PARTY_ADDON', description: 'Free party add-on' },
  5000: { type: 'PRIVATE_HOUR', description: '1 hour private event' },
}
```

---

## 🔒 Privacy & Compliance

### GDPR Compliance

**Data Collection:**
- Customers opt-in for marketing by default (can opt-out)
- Clear purpose for data collection (booking management)
- Consent tracked (marketingOptIn, smsOptIn)

**Data Rights:**
- **Right to Access:** Customers can request their data
- **Right to Erasure:** Admin can delete customer records
- **Right to Rectification:** Customers can update their info
- **Right to Portability:** Export to CSV available

**Best Practices:**
- Don't share customer data with third parties
- Use secure email service (Resend) for campaigns
- Allow unsubscribe in all marketing emails
- Document data retention policy

---

## 📊 Analytics & Reporting

### Customer Metrics Dashboard (Future)

**Key Metrics:**
- Total active customers
- New customers this month
- Customer retention rate
- Average customer lifetime value
- Loyalty tier distribution
- Marketing opt-in rate

**Charts:**
- Customer acquisition over time
- Booking frequency distribution
- Loyalty points distribution
- Tier progression timeline

---

## 🎯 Next Steps (Priority Order)

### High Priority
1. ✅ Run Prisma migration
2. ⏳ Create customer list page
3. ⏳ Create customer detail page
4. ⏳ Add to sidebar navigation
5. ⏳ Sync existing booking data

### Medium Priority
6. ⏳ Integrate with booking creation
7. ⏳ Define loyalty point rules
8. ⏳ Create loyalty rewards catalog
9. ⏳ Add customer export functionality
10. ⏳ Build marketing list builder

### Low Priority
11. ⏳ Email marketing campaign builder
12. ⏳ Customer analytics dashboard
13. ⏳ Automated email campaigns
14. ⏳ Customer portal (self-service)
15. ⏳ Referral program

---

## 📚 Documentation for End Users

### For Admins

**Managing Customers:**
1. Go to Admin Panel > Customers
2. Click "Sync" to import from bookings (first time)
3. Search for customers by email/name/phone
4. Click customer to view full profile
5. Edit contact info, add notes, manage tags

**Loyalty Program:**
1. View customer's current tier and points
2. Add points: [+Points] button
3. Subtract points: [-Points] button
4. Tiers auto-upgrade based on points
5. Manually set VIP tier for special customers

**Marketing Lists:**
1. Go to Admin Panel > Marketing (future)
2. Select filters (tier, tags, min bookings)
3. Preview recipient list
4. Export to CSV or send campaign

---

## 🔗 Related Features

**Implemented:**
- ✅ User Management (`/admin/users`)
- ✅ Booking Management (`/admin/bookings`)
- ✅ Reports & Exports (`/admin/reports`)

**Integration Points:**
- Bookings → Auto-create/update customers
- Users → Link to customer profiles
- Reports → Include customer analytics

---

**Last Updated:** November 25, 2025
**Author:** Claude Code
**Version:** 1.0
**Status:** 🚧 Schema Ready - Migration & UI Pending
