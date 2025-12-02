# Revenue & Financial Dashboard

**Created:** 2025-11-28
**Status:** ✅ Complete
**Location:** `/admin/revenue`

## Overview

Comprehensive financial analytics and revenue tracking dashboard for the admin panel. Provides deep insights into revenue performance, payment status, booking trends, and customer value.

## Features Implemented

### 1. Revenue Analytics Server Actions

**Location:** `app/actions/revenue.ts`

**Available Actions:**

#### `getRevenueStats(startDate?, endDate?)`
Returns comprehensive revenue statistics:
- Total revenue (all bookings)
- Paid revenue (completed payments)
- Pending revenue (unpaid amounts)
- Total bookings count
- Paid vs pending bookings
- Average booking value
- This month vs last month comparison
- Month-over-month growth percentage

#### `getRevenueByType(startDate?, endDate?)`
Revenue breakdown by booking type:
- Revenue per type (CAFE, SENSORY_ROOM, PLAYGROUND, PARTY, EVENT)
- Number of bookings per type
- Average booking value per type

#### `getRevenueOverTime(startDate?, endDate?, interval)`
Revenue trends over time:
- Supports day/week/month intervals
- Revenue and booking count per period
- Formatted for time-series charts

#### `getPaymentStats(startDate?, endDate?)`
Payment status analytics:
- Total paid amount
- Total pending amount
- Full payments count
- Partial payments count
- Unpaid bookings count

#### `getTopCustomers(limit?, startDate?, endDate?)`
Top revenue-generating customers:
- Customer name and email
- Total revenue from customer
- Number of bookings
- Sorted by revenue (highest first)

#### `exportRevenueData(startDate?, endDate?)`
Export revenue data to CSV:
- All booking details
- Revenue amounts
- Payment status
- Customer information
- Formatted CSV with headers

**Security:**
- All actions require ADMIN or SUPER_ADMIN role
- Session-based authentication
- Date range validation

### 2. Revenue Chart Components

#### RevenueLineChart
**Location:** `components/admin/charts/RevenueLineChart.tsx`

- Dual-line chart showing revenue and bookings over time
- Cyan line for revenue, purple line for bookings
- Interactive tooltips with formatted values
- Responsive design
- Currency-aware formatting

#### RevenueByTypeChart
**Location:** `components/admin/charts/RevenueByTypeChart.tsx`

- Bar chart showing revenue by booking type
- Color-coded bars matching booking type colors:
  - Café: Cyan
  - Sensory Room: Purple
  - Playground: Pink
  - Party: Orange
  - Event: Green
- Interactive tooltips
- Rounded bar tops for visual appeal

#### PaymentStatusChart
**Location:** `components/admin/charts/PaymentStatusChart.tsx`

- Two pie charts side-by-side:
  1. **Revenue Status**: Paid vs Pending amounts
  2. **Payment Types**: Full/Partial/Unpaid bookings
- Color-coded:
  - Green: Paid/Full
  - Orange/Yellow: Pending/Partial
  - Red: Unpaid
- Interactive tooltips with currency formatting

### 3. Revenue Dashboard Page

**Location:** `app/admin/revenue/page.tsx`

**Features:**

#### Stats Cards (8 total)
**Row 1:**
- Total Revenue (with month-over-month growth %)
- Paid Revenue
- Pending Revenue
- Average Booking Value

**Row 2:**
- Total Bookings
- Paid Bookings
- Pending Payments
- This Month Revenue (with trend indicator)

#### Date Range Selector
- Last 7 Days
- Last 30 Days
- Last 3 Months
- Last 6 Months
- Last Year

All charts and stats update based on selected range.

#### Export to CSV
- One-click CSV export
- Includes all booking data in selected date range
- Formatted with headers
- Downloads automatically

#### Revenue Over Time Chart
- Line chart showing daily/monthly revenue trends
- Dual metrics: Revenue and bookings count
- Adapts interval based on date range (daily for short, monthly for long)

#### Revenue by Type Chart
- Bar chart breakdown by booking type
- Shows which services generate most revenue
- Identifies high-value booking categories

#### Payment Status Charts
- Visual breakdown of payment completion
- Tracks partial payments
- Identifies unpaid bookings

#### Top Customers List
- Top 10 customers by revenue
- Shows total spend and booking count
- Customer name, email, and ranking
- Helps identify VIP customers

### 4. Admin Sidebar Integration

**Location:** `components/admin/AdminSidebar.tsx`

- Added "Revenue" menu item with dollar icon
- Positioned after Content, before Reports
- Active state highlighting

## Data Structure

### Revenue Statistics
```typescript
interface RevenueStats {
  totalRevenue: number
  paidRevenue: number
  pendingRevenue: number
  totalBookings: number
  paidBookings: number
  pendingBookings: number
  averageBookingValue: number
  currency: string
  thisMonth: number
  lastMonth: number
  monthGrowth: number  // Percentage
}
```

### Revenue by Type
```typescript
interface RevenueByType {
  type: string  // CAFE, SENSORY_ROOM, etc.
  revenue: number
  bookings: number
  averageValue: number
}
```

### Revenue Over Time
```typescript
interface RevenueOverTime {
  date: string  // YYYY-MM-DD or YYYY-MM
  revenue: number
  bookings: number
}
```

### Payment Statistics
```typescript
interface PaymentStats {
  totalPaid: number
  totalPending: number
  fullPayments: number
  partialPayments: number
  unpaidBookings: number
}
```

## Usage

### For Admins:

#### 1. View Revenue Dashboard
1. Navigate to `/admin/revenue`
2. Dashboard loads with last 30 days data by default
3. See 8 stat cards with key metrics
4. Review charts for visual insights

#### 2. Change Date Range
1. Click date range dropdown (top right)
2. Select desired period (7 days to 1 year)
3. All data automatically updates

#### 3. Identify Trends
- **Growth Indicators**: Green up arrow = positive growth, red down = decline
- **Revenue Line Chart**: Spot revenue trends and patterns
- **Type Breakdown**: See which services are most profitable
- **Payment Status**: Monitor unpaid amounts

#### 4. Find Top Customers
- Scroll to "Top Customers" section
- See ranked list by revenue
- Identify VIP customers for special treatment
- Use for targeted marketing

#### 5. Export Data
1. Select desired date range
2. Click "Export CSV" button
3. CSV file downloads automatically
4. Open in Excel/Sheets for further analysis

### For Developers:

#### Accessing Revenue Data

```typescript
import { getRevenueStats } from '@/app/actions/revenue'

// Get last 30 days stats
const result = await getRevenueStats()
if (result.success && result.stats) {
  console.log('Total Revenue:', result.stats.totalRevenue)
  console.log('Growth:', result.stats.monthGrowth, '%')
}

// Get custom date range
const start = new Date('2025-01-01')
const end = new Date('2025-01-31')
const result = await getRevenueStats(start, end)
```

#### Adding New Metrics

1. **Add calculation** in revenue actions:
```typescript
// In getRevenueStats
const refundTotal = bookings.reduce((sum, b) => sum + (b.refundAmount || 0), 0)
```

2. **Update interface**:
```typescript
interface RevenueStats {
  // ...existing fields
  refundTotal: number
}
```

3. **Add stat card** in dashboard:
```typescript
<StatsCard
  title="Total Refunds"
  value={`${stats.refundTotal} ${currency}`}
  icon={RefreshCw}
/>
```

## Business Insights

### Key Metrics Explained

#### Average Booking Value (ABV)
- Total Revenue / Total Bookings
- Indicates average customer spend
- Higher ABV = higher value customers
- Use for pricing optimization

#### Month-over-Month Growth
- ((This Month - Last Month) / Last Month) × 100
- Positive % = growing revenue
- Track to measure business health

#### Payment Completion Rate
- (Paid Bookings / Total Bookings) × 100
- Indicates payment collection efficiency
- Low rate may signal payment process issues

#### Top Customer Concentration
- % of revenue from top 10 customers
- High concentration = business risk
- Diversification may be needed

## Performance

- **Caching**: Results calculated on-demand (consider adding cache layer)
- **Database Indexes**: Leverages existing indexes on `date`, `isPaid`, `paymentDate`
- **Aggregation**: Performs calculations in memory (efficient for typical dataset sizes)
- **Chart Rendering**: Client-side dynamic loading to reduce initial bundle
- **CSV Export**: Streamed download for large datasets

## Future Enhancements

Potential improvements:

1. **Revenue Forecasting** - Predict future revenue based on historical trends
2. **Profit Margins** - Track costs and calculate profit per booking type
3. **Refund Tracking** - Monitor refunds and cancellations
4. **Custom Date Ranges** - Date picker for arbitrary ranges
5. **Recurring Revenue** - Track subscription-like repeat customers
6. **Revenue Goals** - Set targets and track progress
7. **Comparison Mode** - Compare two date periods side-by-side
8. **Real-time Updates** - WebSocket updates for live revenue tracking
9. **Email Reports** - Scheduled revenue reports sent to admins
10. **Advanced Filters** - Filter by booking type, customer segment, etc.
11. **Budget vs Actual** - Compare revenue against budget/forecast
12. **Tax Reporting** - Calculate taxes owed on revenue

## Technical Details

### Component Architecture

```
RevenuePage
├── Date Range Selector
├── Stats Cards (8)
│   ├── Revenue metrics
│   └── Booking metrics
├── Charts Section
│   ├── RevenueLineChart (revenue over time)
│   └── RevenueByTypeChart (breakdown by type)
└── Additional Insights
    ├── PaymentStatusChart (payment completion)
    └── TopCustomers List
```

### State Management

- React `useState` for data and loading states
- `useEffect` to fetch data on mount and date range change
- Optimistic date range updates (immediate UI feedback)

### Data Flow

1. User selects date range
2. Component calculates start/end dates
3. Parallel API calls to all revenue actions
4. State updated with combined results
5. Charts re-render with new data

### Currency Handling

- Default currency: RSD (Serbian Dinar)
- Fetched from first booking in dataset
- Applied consistently across all displays
- Formatted with locale-aware number formatting

## Dependencies

- `date-fns` - Date manipulation and formatting
- `recharts` - Chart library (Line, Bar, Pie charts)
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `framer-motion` - Animations
- Next.js 16 App Router
- TypeScript 5

## Related Files

- `app/actions/revenue.ts` - Revenue analytics actions
- `app/admin/revenue/page.tsx` - Revenue dashboard page
- `components/admin/charts/RevenueLineChart.tsx` - Line chart
- `components/admin/charts/RevenueByTypeChart.tsx` - Bar chart
- `components/admin/charts/PaymentStatusChart.tsx` - Pie charts
- `components/admin/StatsCard.tsx` - Reusable stat card
- `components/admin/AdminSidebar.tsx` - Sidebar with Revenue link
- `prisma/schema.prisma` - Booking model with revenue fields

## Testing

### Manual Testing Checklist:

- [x] Revenue stats calculated correctly
- [x] Charts display with proper data
- [x] Date range selector updates data
- [x] Export CSV functionality works
- [x] Top customers list sorted by revenue
- [x] Currency formatting displays correctly
- [x] Growth percentages calculated accurately
- [x] Payment status breakdown correct
- [ ] Mobile responsive testing (pending)
- [ ] Large dataset performance (pending)
- [ ] Export with 1000+ bookings (pending)

### Test Scenarios:

1. **No Revenue**: Empty state when no bookings exist
2. **Single Currency**: All bookings in RSD
3. **Mixed Currencies**: Bookings in multiple currencies (edge case)
4. **Negative Growth**: Last month higher than this month
5. **Partial Payments**: Mix of full, partial, and unpaid
6. **Long Date Range**: 1 year of data with many bookings
7. **Export Large Dataset**: CSV export with 500+ rows

## Notes

- Revenue calculations only include APPROVED and COMPLETED bookings
- Pending and rejected bookings are excluded from revenue totals
- Partial payments are tracked separately from full payments
- Top customers list helps identify high-value accounts
- CSV export includes all booking details for audit purposes
- All amounts are in the booking's currency (may need multi-currency handling later)
- Month growth compares calendar months, not rolling 30-day periods

---

**Author:** Claude Code
**Version:** 1.0
**Last Updated:** 2025-11-28
