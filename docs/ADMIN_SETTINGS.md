# Admin Settings Page

**Created:** 2025-11-28
**Status:** ✅ Complete
**Location:** `/admin/settings`

## Overview

Comprehensive settings management system for the admin panel allowing centralized configuration of all site-wide settings without touching code.

## Features Implemented

### 1. Database Schema (`SiteSettings` Model)

**Location:** `prisma/schema.prisma`

```prisma
model SiteSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  category  String
  updatedAt DateTime @updatedAt
  updatedBy String?

  @@index([category])
  @@index([key])
}
```

**Key Features:**
- Flexible JSON storage for any value type
- Categorized settings for organization
- Track who last updated each setting
- Indexed for fast lookups

### 2. Settings Server Actions

**Location:** `app/actions/settings.ts`

**Available Actions:**
- `getSetting(key)` - Get a specific setting by key
- `getSettingsByCategory(category)` - Get all settings in a category
- `getAllSettings()` - Get all settings
- `updateSetting(key, value, category)` - Update or create a single setting
- `updateSettings([...])` - Update multiple settings at once
- `initializeDefaultSettings()` - Create all default settings
- `deleteSetting(key)` - Delete a setting (Super Admin only)

**Security:**
- All mutations require ADMIN or SUPER_ADMIN role
- Audit logging for all changes
- Session-based authentication

### 3. Settings Editor Component

**Location:** `components/admin/SettingsEditor.tsx`

**Features:**
- **6 Organized Tabs:**
  1. **General** - Site name, tagline, description, logo
  2. **Contact** - Email, phone, address, Google Maps URL
  3. **Business Hours** - Open/close times for each day of the week
  4. **Social Media** - Facebook, Instagram, Twitter, YouTube links
  5. **Notifications** - Email notification toggles and preferences
  6. **Features** - Feature flags for online booking, loyalty, payments

- **Real-time Change Tracking** - Shows unsaved changes indicator
- **Bulk Save** - Save all changes at once
- **Reset Button** - Revert to original values
- **Validation** - Input validation for emails, URLs, times
- **Loading States** - Proper loading and saving states

### 4. Settings Page

**Location:** `app/admin/settings/page.tsx`

**Features:**
- Auto-loads all settings on mount
- Initialization wizard if no settings exist
- One-click default settings initialization
- Auto-refresh after save
- Error handling with toast notifications

### 5. Admin Sidebar Integration

**Location:** `components/admin/AdminSidebar.tsx`

- Added "Settings" menu item with gear icon
- Positioned before "Audit Logs" for logical flow
- Active state highlighting when on settings page

## Default Settings

When initialized, the system creates the following default settings:

### General (`general` category)
- `site.name` - "Xplorium"
- `site.tagline` - "Family Entertainment Venue"
- `site.description` - Description text
- `site.logo` - Logo URL (empty by default)

### Contact (`contact` category)
- `contact.email` - Contact email
- `contact.phone` - Contact phone
- `contact.address` - Physical address
- `contact.googleMapsUrl` - Google Maps embed URL

### Business Hours (`hours` category)
- `hours.monday` through `hours.sunday`
- Each with: `open`, `close`, `closed` properties
- Default: Mon-Thu 9am-9pm, Fri 9am-10pm, Sat 10am-10pm, Sun 10am-8pm

### Social Media (`social` category)
- `social.facebook` - Facebook page URL
- `social.instagram` - Instagram profile URL
- `social.twitter` - Twitter/X profile URL
- `social.youtube` - YouTube channel URL

### Email Notifications (`notifications` category)
- `email.bookingConfirmation` - Send booking confirmation emails
- `email.bookingApproved` - Send approval emails
- `email.bookingRejected` - Send rejection emails
- `email.lowInventory` - Send low inventory alerts (with threshold setting)

### Features (`features` category)
- `features.onlineBooking` - Enable/disable online booking
- `features.loyaltyProgram` - Enable/disable loyalty points
- `features.payments` - Enable/disable online payments

## Usage

### For Admins:

#### 1. First Time Setup
1. Navigate to `/admin/settings`
2. Click "Initialize Default Settings" button
3. Settings are created with sensible defaults
4. Customize as needed

#### 2. Updating Settings
1. Go to `/admin/settings`
2. Click on the tab for the category you want to edit
3. Modify the fields
4. Notice the "You have unsaved changes" indicator
5. Click "Save Changes" to persist
6. Or click "Reset" to revert

#### 3. Business Hours
- Toggle switches to mark days as Closed
- Use time pickers for open/close times
- Closed days will gray out the time fields

#### 4. Feature Toggles
- Toggle switches to enable/disable features
- Changes take effect immediately after save
- Use for feature flags and A/B testing

### For Developers:

#### Accessing Settings in Code

```typescript
import { getSetting, getSettingsByCategory } from '@/app/actions/settings'

// Get a specific setting
const result = await getSetting('site.name')
if (result.success && result.setting) {
  const siteName = result.setting.value.text
}

// Get all contact settings
const result = await getSettingsByCategory('contact')
if (result.success && result.settings) {
  result.settings.forEach(setting => {
    console.log(setting.key, setting.value)
  })
}
```

#### Adding New Settings

To add a new setting category or settings:

1. **Add to default settings** in `app/actions/settings.ts`:
```typescript
{
  key: 'payment.stripeKey',
  value: { text: '' },
  category: 'payment'
}
```

2. **Add UI in SettingsEditor** component:
```typescript
<TabsContent value="payment">
  <Input
    value={formData['payment.stripeKey']?.text || ''}
    onChange={(e) => updateSetting('payment.stripeKey', { text: e.target.value })}
  />
</TabsContent>
```

3. **Re-initialize** or update settings via admin panel

## Data Structure

### Setting Object:
```typescript
interface Setting {
  id: string
  key: string              // e.g., "site.name"
  value: {                 // Flexible JSON
    text?: string
    url?: string
    enabled?: boolean
    open?: string
    close?: string
    closed?: boolean
    threshold?: number
    // ... any other properties
  }
  category: string         // e.g., "general", "contact", "hours"
  updatedAt: Date
  updatedBy: string | null
}
```

## Security & Authorization

- **Read Access:** Any authenticated admin
- **Update Access:** ADMIN or SUPER_ADMIN roles
- **Delete Access:** SUPER_ADMIN only
- **Initialize:** SUPER_ADMIN only

All mutations are logged to the audit log with:
- User who made the change
- Timestamp
- Changed fields
- IP address and user agent

## Performance

- **Caching:** Settings are fetched per-request (consider adding caching layer for production)
- **Indexing:** Database indexes on `key` and `category` for fast lookups
- **Bulk Updates:** Single transaction for multiple setting updates
- **Revalidation:** Automatic path revalidation after saves

## Future Enhancements

Potential improvements:

1. **Setting Groups** - Nest settings in collapsible groups
2. **Setting Types** - Define schema/types for settings (validation)
3. **Setting History** - Track version history of setting changes
4. **Import/Export** - Export settings as JSON, import from file
5. **Environment-Specific** - Different settings per environment (dev/staging/prod)
6. **Setting Templates** - Pre-defined setting bundles
7. **Live Preview** - Preview changes before saving
8. **Setting Search** - Search across all settings
9. **Setting Descriptions** - Help text for each setting
10. **Setting Dependencies** - Hide/show settings based on other settings

## Technical Details

### Component Architecture

```
SettingsPage (page.tsx)
├── Fetches all settings
├── Handles initialization
└── SettingsEditor
    ├── Tabs Component
    │   ├── General Tab
    │   ├── Contact Tab
    │   ├── Hours Tab
    │   ├── Social Tab
    │   ├── Notifications Tab
    │   └── Features Tab
    ├── Form State Management
    ├── Change Tracking
    └── Save/Reset Actions
```

### State Management

- Uses React `useState` for form state
- Tracks changes with `hasChanges` flag
- Resets to initial state on Reset click
- Optimistic UI updates

### Validation

- Email format validation
- URL format validation (for social media links)
- Time format validation (HH:MM)
- Required field checks
- Number range validation (for thresholds)

## Dependencies

- `@prisma/client` - Database ORM
- `framer-motion` - Animations
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `@/components/ui/*` - shadcn/ui components (Tabs, Input, Switch, Button, etc.)
- Next.js 16 App Router
- TypeScript 5

## Related Files

- `prisma/schema.prisma` - SiteSettings model
- `app/actions/settings.ts` - Server actions
- `components/admin/SettingsEditor.tsx` - Settings editor component
- `app/admin/settings/page.tsx` - Settings page
- `components/admin/AdminSidebar.tsx` - Sidebar with Settings link

## Testing

### Manual Testing Checklist:

- [x] Database schema created
- [x] Settings page loads correctly
- [x] Initialize default settings works
- [x] All tabs display correctly
- [x] Form inputs update state
- [x] Unsaved changes indicator shows
- [x] Save changes persists to database
- [x] Reset button reverts changes
- [x] Business hours toggles work
- [x] Feature toggles work
- [x] Audit log records changes
- [ ] Mobile responsive testing (pending)
- [ ] Permission checks (ADMIN vs SUPER_ADMIN) (pending)
- [ ] Error handling (network errors, validation) (pending)

### Test Scenarios:

1. **First-time user**: No settings exist → See initialization screen
2. **Update setting**: Change site name → Save → Verify in database
3. **Business hours**: Mark Monday as closed → Save → Verify
4. **Bulk update**: Change multiple settings → Save all at once
5. **Reset**: Make changes → Reset → Verify original values
6. **Navigation**: Switch tabs → Values persist across tabs

## Screenshots

(To be added after manual testing)

## Notes

- Settings are stored as JSON for maximum flexibility
- Each setting can have any structure in its `value` field
- The UI adapts based on the expected structure
- Adding new settings requires both backend (default) and frontend (UI) changes
- All changes are audited automatically
- Settings are server-validated (type checks, auth, etc.)

---

**Author:** Claude Code
**Version:** 1.0
**Last Updated:** 2025-11-28
