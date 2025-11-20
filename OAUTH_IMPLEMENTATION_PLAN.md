# 🎯 OAuth Implementation Plan: Google & Facebook Sign-In

## Current State Analysis

- ✅ Using NextAuth v5 (Auth.js)
- ✅ Credentials provider already configured
- ✅ JWT session strategy
- ✅ Prisma + PostgreSQL database
- ⚠️ Database schema needs OAuth support (Account, Session models)
- ⚠️ Password field is required (needs to be optional for OAuth users)

---

## 📋 Implementation Steps

### **Phase 1: Database Schema Updates**

**Goal:** Add OAuth support to Prisma schema

**Changes needed:**
1. Add `Account` model for OAuth provider accounts
2. Add `Session` model for database sessions (optional, but recommended)
3. Make `password` field optional in User model
4. Add provider-specific fields

**Files to modify:**
- `prisma/schema.prisma`

**Tasks:**
- [ ] Add Account model with provider, providerAccountId, etc.
- [ ] Add Session model (if using database sessions)
- [ ] Change User.password from `String` to `String?`
- [ ] Add accounts relation to User model
- [ ] Run migration: `npx prisma migrate dev --name add-oauth-support`
- [ ] Run `npx prisma generate` to update Prisma Client

**Schema additions needed:**

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

**User model updates:**

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  password      String?   // Changed from String to String? (optional)
  role          Role      @default(USER)
  image         String?
  blocked       Boolean   @default(false)

  // Relations
  accounts      Account[]  // NEW
  sessions      Session[]  // NEW
  bookings      Booking[]
  auditLogs     AuditLog[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([role])
}
```

---

### **Phase 2: Environment Variables Setup**

**Goal:** Configure OAuth app credentials

#### **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
8. Copy Client ID and Client Secret

#### **Facebook OAuth Setup**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app or select existing one
3. Add "Facebook Login" product
4. Go to Settings > Basic
5. Copy App ID and App Secret
6. Go to Facebook Login > Settings
7. Add OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (development)
   - `https://yourdomain.com/api/auth/callback/facebook` (production)
8. Make sure app is in "Development" mode for testing
9. Switch to "Live" mode when ready for production

#### **Environment Variables**

Add to `.env` file:

```bash
# NextAuth
AUTH_SECRET=your-auth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
```

Add to `.env.example`:

```bash
# NextAuth
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Facebook OAuth
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

**Tasks:**
- [ ] Create Google OAuth app
- [ ] Create Facebook OAuth app
- [ ] Add environment variables to `.env`
- [ ] Update `.env.example` with placeholders
- [ ] Test environment variables are loaded

---

### **Phase 3: Update Authentication Configuration**

**Goal:** Add OAuth providers to NextAuth

**Files to modify:**
- `lib/auth.ts`

**Changes:**

1. Import OAuth providers:
```typescript
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
```

2. Add providers to configuration:
```typescript
providers: [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    }
  }),
  Facebook({
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  }),
  Credentials({ ... }) // Keep existing
],
```

3. Update adapter to use Prisma:
```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [ ... ],
  // ... rest of config
})
```

4. Update callbacks to handle OAuth users:
```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Allow OAuth sign-ins
    if (account?.provider === 'google' || account?.provider === 'facebook') {
      // Check if user is blocked
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (dbUser?.blocked) {
        return false // Deny sign-in for blocked users
      }

      return true
    }

    // Keep existing Credentials logic
    return true
  },

  async jwt({ token, user, account, trigger }) {
    // Initial sign in
    if (user) {
      token.id = user.id
      token.role = user.role
      token.lastActivity = Date.now()
    }

    // Existing logic...
    return token
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string
      session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
    }
    return session
  },
},
```

**Tasks:**
- [ ] Install Prisma adapter: `npm install @auth/prisma-adapter`
- [ ] Import OAuth providers
- [ ] Add providers to NextAuth config
- [ ] Add PrismaAdapter
- [ ] Update callbacks for OAuth handling
- [ ] Test basic OAuth flow

---

### **Phase 4: Update Sign-In/Sign-Up UI**

**Goal:** Add OAuth buttons to authentication modals

**Files to modify:**
- `components/auth/SignInModal.tsx`
- `components/auth/SignUpModal.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│      Sign In to Xplorium           │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔵  Continue with Google    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔵  Continue with Facebook  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ──────── Or continue with ────────│
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Password                           │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Forgot Password?]                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Sign In              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Don't have an account? Sign Up     │
└─────────────────────────────────────┘
```

**Component Code Example:**

```typescript
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook } from 'react-icons/fa'

export function SignInModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)

  const handleOAuthSignIn = async (providerName: 'google' | 'facebook') => {
    try {
      setIsLoading(true)
      setProvider(providerName)
      await signIn(providerName, { callbackUrl: '/' })
    } catch (error) {
      console.error('OAuth sign-in error:', error)
      toast.error('Failed to sign in')
    } finally {
      setIsLoading(false)
      setProvider(null)
    }
  }

  return (
    <div>
      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
        >
          {provider === 'google' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FcGoogle className="w-5 h-5 mr-2" />
          )}
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5]"
          onClick={() => handleOAuthSignIn('facebook')}
          disabled={isLoading}
        >
          {provider === 'facebook' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FaFacebook className="w-5 h-5 mr-2" />
          )}
          Continue with Facebook
        </Button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Existing email/password form */}
      {/* ... */}
    </div>
  )
}
```

**Required Icons Package:**

```bash
npm install react-icons
```

**Tasks:**
- [ ] Install react-icons package
- [ ] Create OAuth button component
- [ ] Update SignInModal with OAuth buttons
- [ ] Update SignUpModal with OAuth buttons
- [ ] Add loading states for each provider
- [ ] Style buttons with provider branding
- [ ] Add divider between OAuth and credentials
- [ ] Test UI on mobile and desktop

---

### **Phase 5: Handle OAuth User Creation & Edge Cases**

**Goal:** Properly handle all OAuth scenarios

**Scenarios to handle:**

1. **New user signs in with OAuth**
   - Create user account
   - Set role to 'USER'
   - Set emailVerified to current date
   - No password needed

2. **Existing email with credentials, signs in with OAuth**
   - Link OAuth account to existing user
   - Allow user to sign in with either method

3. **Existing OAuth user signs in again**
   - Just sign them in
   - Update last activity

4. **User tries to use credentials but only has OAuth**
   - Show error: "This email is registered with Google/Facebook. Please use that to sign in."

5. **Blocked user tries OAuth sign-in**
   - Deny access
   - Show error message

**Implementation in `lib/auth.ts`:**

```typescript
callbacks: {
  async signIn({ user, account, profile, credentials }) {
    // OAuth sign-in
    if (account?.provider !== 'credentials') {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        // Check if user is blocked
        if (existingUser?.blocked) {
          throw new Error('Your account has been blocked. Please contact support.')
        }

        // User exists, just sign in
        if (existingUser) {
          return true
        }

        // New OAuth user - account will be created by adapter
        return true
      } catch (error) {
        console.error('OAuth sign-in error:', error)
        return false
      }
    }

    // Credentials sign-in (existing logic)
    return true
  },

  // ... other callbacks
}
```

**Update Credentials authorize function:**

```typescript
async authorize(credentials) {
  // ... existing validation

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true }, // Include OAuth accounts
  })

  if (!user) {
    return null
  }

  // Check if user only has OAuth accounts (no password)
  if (!user.password && user.accounts.length > 0) {
    const providers = user.accounts.map(acc => acc.provider).join(', ')
    throw new Error(`This email is registered with ${providers}. Please use that to sign in.`)
  }

  // ... rest of existing logic
}
```

**Tasks:**
- [ ] Handle new OAuth user creation
- [ ] Handle existing email + OAuth linking
- [ ] Check for blocked users in OAuth flow
- [ ] Add error messages for OAuth-only accounts
- [ ] Test all scenarios thoroughly

---

### **Phase 6: Update Sign-Up Flow**

**Goal:** Update SignUpModal to work with OAuth

**Changes needed:**

1. Show OAuth buttons at top of sign-up modal
2. Keep credentials sign-up option
3. Handle "Email already exists" for OAuth users
4. Redirect properly after OAuth sign-up

**SignUpModal.tsx updates:**

```typescript
// Same OAuth buttons as SignInModal
<Button onClick={() => handleOAuthSignIn('google')}>
  Continue with Google
</Button>
<Button onClick={() => handleOAuthSignIn('facebook')}>
  Continue with Facebook
</Button>

{/* Divider */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="bg-white px-2 text-gray-500">
      Or sign up with email
    </span>
  </div>
</div>

{/* Existing email/password sign-up form */}
```

**Tasks:**
- [ ] Add OAuth buttons to SignUpModal
- [ ] Update error handling
- [ ] Test OAuth sign-up flow
- [ ] Ensure proper redirects

---

### **Phase 7: Security & Production Preparation**

**Goal:** Secure OAuth implementation for production

**Security checklist:**

- [ ] Verify `AUTH_SECRET` is strong and unique
- [ ] Never commit OAuth credentials to Git
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Add rate limiting to auth endpoints (optional)
- [ ] Review OAuth scopes (only request what's needed)
- [ ] Test with blocked users
- [ ] Test session expiration
- [ ] Add logging for OAuth errors

**Production setup:**

1. **Update OAuth app settings:**
   - Add production domain to authorized origins
   - Add production callback URLs
   - Remove localhost URLs from production

2. **Environment variables for production:**
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=production_client_id
   GOOGLE_CLIENT_SECRET=production_secret
   FACEBOOK_CLIENT_ID=production_app_id
   FACEBOOK_CLIENT_SECRET=production_secret
   ```

3. **Google OAuth Production:**
   - Submit app for verification if requesting sensitive scopes
   - Add privacy policy URL
   - Add terms of service URL
   - Verify domain ownership

4. **Facebook OAuth Production:**
   - Switch app from "Development" to "Live" mode
   - Complete App Review if needed
   - Add privacy policy URL
   - Add terms of service URL
   - Configure Data Deletion callback URL

**Tasks:**
- [ ] Review security checklist
- [ ] Update OAuth apps with production URLs
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Test in production environment
- [ ] Monitor OAuth errors in production

---

### **Phase 8: Optional Enhancements**

**Goal:** Improve user experience

**Enhancements to consider:**

1. **Account Linking Page**
   - Show which OAuth providers are connected
   - Allow users to link multiple providers
   - Allow users to unlink providers
   - Add password to OAuth-only account

2. **Profile Page Updates**
   - Show sign-in method (Google, Facebook, Email)
   - Show profile picture from OAuth provider
   - Allow changing profile picture

3. **Better Error Messages**
   - "Account exists with different provider"
   - "Please use Google to sign in"
   - "Email already registered"

4. **OAuth Profile Picture**
   - Save profile picture URL from OAuth
   - Display in user profile
   - Update on each sign-in

**Example Account Settings UI:**

```
┌─────────────────────────────────┐
│   Connected Accounts            │
├─────────────────────────────────┤
│  ✅ Google                      │
│     connected as user@gmail.com │
│     [Disconnect]                │
│                                 │
│  ❌ Facebook                    │
│     [Connect Facebook]          │
│                                 │
│  ✅ Email & Password            │
│     [Change Password]           │
└─────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### OAuth Sign-In Tests

- [ ] **New user - Google sign-in**
  - Creates new user account
  - Sets role to USER
  - Sets emailVerified
  - Redirects to homepage
  - Can access protected routes

- [ ] **New user - Facebook sign-in**
  - Creates new user account
  - Sets role to USER
  - Sets emailVerified
  - Redirects to homepage
  - Can access protected routes

- [ ] **Existing OAuth user - sign in again**
  - Signs in successfully
  - Session persists
  - Profile data is current

- [ ] **Existing credentials user - OAuth sign-in**
  - Links OAuth account to existing user
  - Can sign in with either method
  - Profile data merges correctly

- [ ] **Blocked user - OAuth attempt**
  - Denies access
  - Shows error message
  - Does not create session

- [ ] **OAuth user - credentials attempt**
  - Shows helpful error
  - Suggests using OAuth provider
  - Does not allow sign-in

### UI/UX Tests

- [ ] OAuth buttons render correctly
- [ ] Loading states work
- [ ] Error messages display
- [ ] Mobile responsive
- [ ] Icons display correctly
- [ ] Divider looks good

### Integration Tests

- [ ] Sign-out works for OAuth users
- [ ] Session expiration works
- [ ] Admin panel access (if OAuth admin)
- [ ] Booking creation works
- [ ] Profile page shows correct data
- [ ] Multiple browser tabs stay synced

### Edge Cases

- [ ] Network error during OAuth
- [ ] User cancels OAuth flow
- [ ] Invalid OAuth credentials
- [ ] Expired OAuth tokens
- [ ] Rate limiting (if implemented)

---

## 📦 Dependencies Summary

**Required packages:**

```bash
npm install @auth/prisma-adapter react-icons
```

**Already installed:**
- `next-auth` (v5)
- `@prisma/client`
- `prisma`

---

## 🚀 Deployment Steps

1. **Pre-deployment:**
   - [ ] Run all tests
   - [ ] Review security checklist
   - [ ] Update OAuth apps with production URLs
   - [ ] Set production environment variables

2. **Database migration:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Deploy application:**
   - [ ] Deploy to hosting platform
   - [ ] Verify environment variables
   - [ ] Test OAuth flows in production

4. **Post-deployment:**
   - [ ] Test Google OAuth in production
   - [ ] Test Facebook OAuth in production
   - [ ] Monitor error logs
   - [ ] Verify user creation works

---

## 📚 Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [NextAuth.js OAuth Providers](https://authjs.dev/getting-started/providers/oauth-tutorial)
- [Prisma Adapter for NextAuth](https://authjs.dev/reference/adapter/prisma)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [NextAuth.js GitHub Examples](https://github.com/nextauthjs/next-auth-example)

---

## ⚠️ Common Issues & Solutions

### Issue: "OAuth callback error"
**Solution:** Verify callback URLs match exactly in OAuth app settings

### Issue: "Invalid client secret"
**Solution:** Double-check environment variables, regenerate secrets if needed

### Issue: "User already exists"
**Solution:** Implement account linking logic in signIn callback

### Issue: "Session not persisting"
**Solution:** Check cookie settings, ensure NEXTAUTH_URL is correct

### Issue: "CSRF token mismatch"
**Solution:** Ensure cookies are enabled, check same-site cookie settings

---

## 📝 Notes

- OAuth users don't need passwords
- OAuth emails are pre-verified
- Consider account linking for better UX
- Test thoroughly before production
- Keep OAuth credentials secure
- Monitor OAuth error logs
- Consider adding more providers (GitHub, Twitter, etc.)

---

**Implementation Priority:** HIGH
**Estimated Time:** 4-6 hours
**Complexity:** Medium
**Dependencies:** Database migration required

---

*This plan was created for Xplorium - Family Entertainment Venue*
*Last updated: 2025-01-20*
