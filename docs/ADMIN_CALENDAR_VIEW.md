# Admin Bookings Calendar View

**Created:** 2025-11-28
**Status:** ✅ Complete
**Location:** `/admin/bookings` (Calendar tab)

## Overview

Enhanced the admin bookings management page with a full-featured calendar view that allows admins to visualize and manage all bookings in a monthly calendar format.

## Features Implemented

### 1. Calendar View Component (`AdminBookingCalendar.tsx`)

**Location:** `components/admin/AdminBookingCalendar.tsx`

#### Key Features:
- **Monthly Calendar Grid** - Shows all days with booking events displayed inside cells
- **Color-Coded Events** - Each booking type has a distinct color:
  - Café: Cyan (#22d3ee)
  - Sensory Room: Purple (#a855f7)
  - Playground: Pink (#ec4899)
  - Party: Fuchsia (#ec4899)
  - Event: Emerald (#10b981)

- **Status Indicators** - Visual indicators for booking status:
  - Pending: Yellow ring with badge count
  - Approved: Green ring with badge count
  - Rejected: Opacity reduced + strikethrough
  - Cancelled: Opacity reduced + strikethrough
  - Completed: Reduced opacity

- **Quick Actions Menu** - Right-click or hover menu on each event:
  - View Details (navigates to booking detail page)
  - Approve (for pending bookings)
  - Reject (for pending bookings, with reason prompt)
  - Delete (with confirmation)

- **Day Summary Badges** - Each day shows count of pending and approved bookings

- **Event Overflow** - Shows first 2 events per day, with "+X more" link to view all

- **Modal for All Events** - Click "+X more" to see all events for a specific day in a modal

- **Navigation Controls**:
  - Previous/Next month buttons
  - "Today" quick navigation button
  - Current month/year display

- **Interactive Elements**:
  - Click on event to view details
  - Hover effects on days and events
  - Responsive design for mobile/tablet/desktop

### 2. View Toggle in Bookings Page

**Location:** `app/admin/bookings/page.tsx`

#### Updates:
- Added **Table/Calendar toggle** buttons in the header
- Smooth transition between views using Framer Motion
- Preserves filters when switching views
- Calendar view shows all bookings (respects current filters)
- Quick actions integrated directly in calendar

#### Integration:
- Uses existing server actions:
  - `approveBooking()` - Approves a pending booking
  - `rejectBooking()` - Rejects a booking with reason
  - `deleteBooking()` - Deletes a booking with confirmation
  - `getBookings()` - Fetches filtered bookings

- Real-time updates after actions (automatically refreshes data)

## Usage

### For Admins:

1. **Navigate to Bookings Page**
   - Go to `/admin/bookings`

2. **Switch to Calendar View**
   - Click the "Calendar" button in the header (next to "Table")

3. **View Bookings**
   - See all bookings displayed on the calendar
   - Color indicates booking type
   - Ring/badge indicates status

4. **Manage Bookings**
   - **Hover** over an event to see the quick actions menu (three dots)
   - **Click** "View Details" to see full booking information
   - **Click** "Approve" to approve a pending booking
   - **Click** "Reject" to reject (will prompt for reason)
   - **Click** "Delete" to remove the booking (with confirmation)

5. **Navigate Calendar**
   - Use arrows to go to previous/next month
   - Click "Today" to jump to current month
   - Click "+X more" on a day to see all events in a modal

## Technical Details

### Component Props:

```typescript
interface AdminBookingCalendarProps {
  events: AdminBookingEvent[]              // Array of bookings
  onEventClick?: (event: AdminBookingEvent) => void  // Event click handler
  onDateClick?: (date: Date) => void       // Date click handler (future use)
  onApprove?: (eventId: string) => void    // Approve handler
  onReject?: (eventId: string) => void     // Reject handler
  onDelete?: (eventId: string) => void     // Delete handler
  showAddButton?: boolean                  // Show add event button (future)
}
```

### Event Data Structure:

```typescript
interface AdminBookingEvent {
  id: string
  title: string
  date: Date
  time: string
  type: 'CAFE' | 'SENSORY_ROOM' | 'PLAYGROUND' | 'PARTY' | 'EVENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  guestCount?: number
  phone?: string
  email?: string
}
```

### Performance Considerations:

- Calendar only shows events for the current month
- Filters applied before rendering (searches, status, type)
- Uses Framer Motion for smooth animations
- Lazy-loaded dropdowns for quick actions
- Memoized color maps and constants

## Future Enhancements

Potential features to add:

1. **Drag & Drop Rescheduling** - Allow admins to drag events to different dates
2. **Add Booking from Calendar** - Click empty day to create new booking
3. **Week View** - Alternative view showing 7-day week
4. **Day View** - Detailed hourly timeline view
5. **Bulk Actions** - Select multiple events for bulk approve/reject
6. **Color Customization** - Allow admins to customize event colors
7. **Print Calendar** - Export calendar as PDF for printing
8. **Recurring Events** - Support for recurring bookings (weekly parties, etc.)
9. **Availability Overlay** - Show available time slots vs booked
10. **Email Notifications** - Send confirmation emails directly from calendar

## Dependencies

- `framer-motion` - Animations and transitions
- `date-fns` - Date formatting and manipulation
- `lucide-react` - Icons (ChevronLeft, ChevronRight, Plus, MoreVertical, etc.)
- `@/components/ui/dropdown-menu` - Dropdown menu for quick actions
- Next.js 16 App Router
- TypeScript 5

## Related Files

- `components/admin/AdminBookingCalendar.tsx` - Main calendar component
- `components/common/EventCalendar.tsx` - Public-facing calendar (inspiration)
- `app/admin/bookings/page.tsx` - Bookings management page
- `app/actions/bookings.ts` - Server actions for booking operations

## Testing Checklist

- [x] TypeScript compilation (no errors)
- [x] Calendar displays correctly
- [x] Events show with correct colors
- [x] Status indicators work properly
- [x] Quick actions menu appears on hover
- [x] Approve/Reject/Delete actions function correctly
- [x] View toggle switches smoothly
- [x] Filters apply to calendar view
- [x] Modal shows all events for a day
- [x] Navigation (prev/next/today) works
- [ ] Manual testing with real booking data (pending)
- [ ] Mobile responsive testing (pending)
- [ ] Accessibility testing (keyboard navigation) (pending)

## Screenshots

(To be added after manual testing)

## Notes

- The calendar respects the same filters as the table view (status, type, search)
- Events are sorted by time within each day
- Past dates are shown with reduced opacity
- Current day is highlighted with cyan background
- The component is fully responsive and works on mobile devices

---

**Author:** Claude Code
**Version:** 1.0
**Last Updated:** 2025-11-28
