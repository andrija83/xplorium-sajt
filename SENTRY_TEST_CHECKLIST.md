# Sentry Testing Checklist

Follow these steps in order to verify Sentry is working correctly.

## ✅ Step 1: Check Configuration (REQUIRED FIRST)

Visit: `https://your-domain.vercel.app/api/sentry-debug`

**Expected Response:**
```json
{
  "message": "Sentry Configuration Debug",
  "debug": {
    "nodeEnv": "production",
    "hasSentryDsn": true,
    "sentryDsnPrefix": "https://3923b38da337...",
    "hasSentryOrg": true,
    "hasSentryProject": true,
    "hasSentryAuthToken": true,
    "sentryOrg": "mycompany-qzw",
    "sentryProject": "javascript-nextjs-p0"
  }
}
```

### ❌ If ANY value is `false`:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables for **Production**, **Preview**, AND **Development**:
   ```
   NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
   SENTRY_ORG=<your-org-slug>
   SENTRY_PROJECT=<your-project-slug>
   SENTRY_AUTH_TOKEN=<your-auth-token>
   ```

   (Get these values from your Sentry dashboard and Vercel settings)

3. **IMPORTANT:** After adding env vars, go to **Deployments** tab and click **Redeploy** on the latest deployment

4. Wait 2-3 minutes for redeployment, then check `/api/sentry-debug` again

---

## ✅ Step 2: Open Browser Console

1. Open your site: `https://your-domain.vercel.app/sentry-test`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. You should see Sentry debug messages like:
   ```
   [Sentry] Event captured
   [Sentry] Sending event
   ```

---

## ✅ Step 3: Test Client-Side Error

1. Click **"1. Test Client Error"** button
2. Check browser console for:
   - `✅ Client error sent to Sentry!` message
   - Sentry debug logs showing event was sent
3. Go to Sentry dashboard: https://mycompany-qzw.sentry.io/issues/
4. Within 30-60 seconds, you should see a new issue:
   - **Title:** "Sentry Test: Client-side error thrown"
   - **Environment:** production
   - **Full stack trace** (readable code, not minified)

---

## ✅ Step 4: Test API Route Error

1. Click **"2. Test API Error"** button
2. Wait for the response message
3. Check Sentry dashboard for:
   - **Title:** "Sentry Test: Automatic error capture test"
   - **Type:** Server-side error
   - **Stack trace** from API route

---

## ✅ Step 5: Test Manual Message

1. Click **"3. Test Message"** button
2. Check Sentry dashboard → **Issues** tab
3. Look for an info-level message:
   - **Title:** "Sentry Test: Manual test message from client"
   - **Level:** Info (blue icon)

---

## ✅ Step 6: Test Unhandled Error (ErrorBoundary)

1. Click **"4. Test Unhandled Error"** button
2. The page should crash and show ErrorBoundary UI
3. Check Sentry for:
   - **Title:** "Sentry Test: Unhandled error for ErrorBoundary"
   - **Session Replay** should be available (if you clicked around before error)
4. Click **"Return to Home"** to reset

---

## 🔍 Troubleshooting

### Issue: "Nothing in Sentry dashboard"

**Check:**
1. Did you wait 60 seconds? (Sentry has slight delay)
2. Is `/api/sentry-debug` showing all `true` values?
3. Are you looking at the correct project? (javascript-nextjs-p0)
4. Check browser console for Sentry debug messages
5. Try **All Issues** instead of **Unresolved** filter in Sentry

### Issue: "Environment variables are false"

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Make sure `NEXT_PUBLIC_SENTRY_DSN` is set for all environments
3. **Redeploy** after adding variables
4. Check `/api/sentry-debug` again

### Issue: "Errors not readable (minified)"

**Fix:**
1. Check that `SENTRY_AUTH_TOKEN` is set in Vercel
2. Check build logs for "Sentry source maps uploaded" message
3. If missing, source maps didn't upload (needs auth token)

### Issue: "Browser console shows error"

**Common errors:**
- `Failed to load Sentry`: DSN is wrong
- `Sentry is not defined`: Script didn't load
- `Network error`: Check firewall/ad-blocker

---

## ✅ Success Checklist

After testing, you should see:

- [x] `/api/sentry-debug` shows all `true` values
- [x] Browser console shows Sentry debug messages
- [x] Sentry dashboard has 3-4 new issues
- [x] Errors have readable stack traces (not minified)
- [x] Errors show correct environment (production/preview)
- [x] Session replay is available (if you interacted before error)

---

## 🧹 Cleanup After Testing

Once Sentry is confirmed working:

1. **Delete test files:**
   ```bash
   rm app/sentry-test/page.tsx
   rm app/api/sentry-test/route.ts
   rm app/api/sentry-debug/route.ts
   rm lib/sentry-test.ts
   ```

2. **Disable debug mode** (change back to production-only):

   In `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`:
   ```typescript
   debug: false,
   enabled: process.env.NODE_ENV === 'production',
   ```

3. **Commit changes:**
   ```bash
   git add -A
   git commit -m "Remove Sentry test files and disable debug mode"
   git push
   ```

4. **Clear test errors from Sentry:**
   - Go to Sentry dashboard
   - Click on each test issue
   - Click **Resolve** button
   - Or delete if you prefer

---

## 📊 What to Monitor After Setup

With Sentry configured, you'll now automatically see:

1. **JavaScript errors** in production
2. **API route errors** on the server
3. **Performance issues** (slow pages, API calls)
4. **Session replays** when errors occur
5. **User context** (browser, OS, location)
6. **Breadcrumbs** (actions before error)

**Check your dashboard weekly** to catch and fix issues!

---

**Current Status:** Testing in progress...
