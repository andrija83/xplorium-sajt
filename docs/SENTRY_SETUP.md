# Sentry Setup Guide

This document explains how to set up Sentry error tracking for the Xplorium project.

## Overview

Sentry is configured to:
- ✅ Track errors automatically in production
- ✅ Record session replays when errors occur
- ✅ Monitor performance metrics (10% sample rate)
- ✅ Upload source maps for better stack traces
- ✅ Circumvent ad-blockers via `/monitoring` route
- ✅ Monitor Vercel Cron jobs automatically

## Setup Steps

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and create an account (or sign in)
2. Create a new project for Next.js
3. Copy your DSN (Data Source Name)

### 2. Add Environment Variables

Add these to your `.env.local` file (development) and Vercel environment variables (production):

```bash
# Required for error tracking
NEXT_PUBLIC_SENTRY_DSN="https://YOUR_KEY@o123456.ingest.sentry.io/123456"

# Required for source maps upload
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
SENTRY_AUTH_TOKEN="sntrys_YOUR_AUTH_TOKEN"
```

### 3. Get Sentry Auth Token

1. Go to Sentry Settings → Auth Tokens: https://sentry.io/settings/account/api/auth-tokens/
2. Create a new token with these scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Copy the token and add it to your environment variables

### 4. Deploy to Vercel

1. Add all environment variables to Vercel:
   - Go to your project → Settings → Environment Variables
   - Add `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
   - Apply to: Production, Preview, Development

2. Redeploy your application

## How It Works

### Client-Side Errors

Errors in React components, event handlers, and client-side code are automatically captured by `sentry.client.config.ts`.

### Server-Side Errors

Errors in server actions, API routes, and middleware are captured by `sentry.server.config.ts`.

### Edge Runtime Errors

Errors in edge middleware are captured by `sentry.edge.config.ts`.

## Testing Sentry

### In Development (Sentry Disabled)

Sentry is disabled in development by default. To test locally:

1. Temporarily change `enabled: process.env.NODE_ENV === 'production'` to `enabled: true` in the config files
2. Run `npm run dev`
3. Trigger a test error
4. Restore the config when done

### In Production

Sentry will automatically capture errors in production. To test:

1. Deploy to Vercel
2. Visit your deployed site
3. Trigger an error (e.g., broken page, failed API call)
4. Check Sentry dashboard for the error

## Features Enabled

### Error Tracking
- All unhandled errors are captured
- Stack traces with source maps
- Breadcrumbs showing user actions before error
- User context (if authenticated)

### Session Replay
- **Enabled only on errors** (to save quota)
- Records last 60 seconds before error
- Masked PII (text and media blocked by default)
- Helpful for debugging user-reported issues

### Performance Monitoring
- 10% of transactions tracked in production
- 100% tracked in development
- Tracks:
  - Page load times
  - API route performance
  - Database query times
  - React component render times

### Source Maps
- Automatically uploaded on build
- Hidden from client bundles (security)
- Provides readable stack traces in Sentry

## Configuration Files

- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- `next.config.mjs` - Sentry webpack plugin configuration
- `.sentryclirc` - Sentry CLI configuration (optional)

## Monitoring Route

Sentry requests are tunneled through `/monitoring` to circumvent ad-blockers. This route is automatically configured and doesn't conflict with Next.js middleware.

## Cost Considerations

Sentry pricing is based on:
- **Events:** Each error counts as 1 event
- **Transactions:** Each performance trace counts as 1 transaction
- **Replays:** Each session replay counts separately

Free tier includes:
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month

Our configuration:
- Session replays only on errors (conserves quota)
- 10% performance sampling (reduces cost)
- Only enabled in production (no dev quota usage)

## Troubleshooting

### Source Maps Not Uploading

1. Verify `SENTRY_AUTH_TOKEN` is set in Vercel
2. Check build logs for Sentry upload errors
3. Verify token has correct scopes

### Errors Not Appearing in Sentry

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Check browser console for Sentry initialization messages
3. Verify Sentry is enabled (`NODE_ENV === 'production'`)
4. Check Sentry dashboard filters (environment, release, etc.)

### Session Replays Not Recording

1. Verify replays are enabled in Sentry project settings
2. Check that `replaysOnErrorSampleRate` is > 0
3. Note: Replays only trigger on errors, not on every session

## Best Practices

1. **Don't log sensitive data:** Sentry automatically masks text and media in replays
2. **Use breadcrumbs:** Add custom breadcrumbs for important user actions
3. **Set user context:** Helps identify affected users (we use session email)
4. **Tag errors:** Use tags to categorize errors (e.g., `component: 'booking'`)
5. **Set release versions:** Track which deploy caused issues (automatic with Vercel)

## Additional Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Sentry Pricing](https://sentry.io/pricing/)

---

**Status:** Configured ✅
**Last Updated:** 2025-12-06
