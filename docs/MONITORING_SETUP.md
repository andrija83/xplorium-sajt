# Monitoring & Observability Setup Guide

**Status:** Phase 3 - In Progress
**Last Updated:** 2025-12-11

## Overview

This guide covers the complete monitoring and observability stack for the Xplorium platform, including error tracking, uptime monitoring, performance monitoring, and logging.

---

## 1. Sentry Error Tracking ✅ CONFIGURED

**Status:** ✅ Configured and production-ready

### Current Setup

- **Package:** `@sentry/nextjs` v10.29.0
- **Configuration Files:**
  - `sentry.client.config.ts` - Client-side error tracking
  - `sentry.server.config.ts` - Server-side error tracking
  - `sentry.edge.config.ts` - Edge runtime error tracking
  - `.sentryclirc` - Sentry CLI configuration

### Configuration Details

**Client-Side** (`sentry.client.config.ts`):
- ✅ Environment-aware (production only)
- ✅ Performance monitoring (10% sample rate in production)
- ✅ Session Replay with privacy (masks text, blocks media)
- ✅ Replay on error (100% capture rate)
- ✅ Filter out warnings in production

**Server-Side** (`sentry.server.config.ts`):
- ✅ Environment-aware (production only)
- ✅ Performance monitoring (10% sample rate in production)
- ✅ Debug mode in development only
- ✅ Filter out warnings in production

### Required Environment Variables

```bash
# Vercel Environment Variables
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org-name
SENTRY_PROJECT=xplorium
SENTRY_AUTH_TOKEN=sntrys_...
```

### Setting Up Sentry (Already Done)

The Sentry wizard was already run:
```bash
npx @sentry/wizard@latest -i nextjs
```

### Testing Sentry

To verify Sentry is working:

1. **Create test error page** (optional):
```typescript
// app/sentry-test/page.tsx
export default function SentryTestPage() {
  return (
    <button onClick={() => { throw new Error('Sentry test error'); }}>
      Trigger Sentry Error
    </button>
  );
}
```

2. **Visit** `/sentry-test` in production and click the button
3. **Check** Sentry dashboard for the error

### Sentry Dashboard

Access your Sentry dashboard at:
- https://sentry.io/organizations/[your-org]/projects/xplorium/

**What to monitor:**
- Error rate and trends
- Most common errors
- Performance metrics (p95 latency)
- Session replays of errors

---

## 2. Health Check Endpoint ✅ IMPLEMENTED

**Status:** ✅ Production-ready

### Endpoint Details

**URL:** `https://xplorium.com/api/health`

**Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 123456,
  "checks": {
    "database": {
      "status": "up",
      "latency": 45
    }
  }
}
```

**Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-12-11T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 123456,
  "checks": {
    "database": {
      "status": "down",
      "error": "Database connection failed"
    }
  }
}
```

**HTTP Status Codes:**
- `200 OK` - All systems healthy
- `503 Service Unavailable` - One or more systems unhealthy

**Features:**
- ✅ Database connectivity check
- ✅ Latency measurement
- ✅ Proper HTTP status codes
- ✅ Logger integration
- ✅ TypeScript types
- ✅ Detailed error messages (dev only)

---

## 3. Better Uptime Monitoring ⏳ TO DO

**Status:** ⏳ Ready to configure (requires account setup)

### Setup Instructions

#### Step 1: Create Account

1. Go to https://betteruptime.com
2. Sign up for free account (10 monitors included)
3. Verify email

#### Step 2: Create Monitors

Create these monitors in Better Uptime dashboard:

**Monitor 1: Homepage**
- Name: `Xplorium - Homepage`
- URL: `https://xplorium.com/`
- Check frequency: Every 1 minute
- Request timeout: 30 seconds
- Expected status code: `200`
- Locations: At least 2 different regions

**Monitor 2: Health Check**
- Name: `Xplorium - Health API`
- URL: `https://xplorium.com/api/health`
- Check frequency: Every 1 minute
- Request timeout: 30 seconds
- Expected status code: `200`
- Check response: Contains `"status":"healthy"`
- Locations: At least 2 different regions

**Monitor 3: Booking Page**
- Name: `Xplorium - Booking Page`
- URL: `https://xplorium.com/booking`
- Check frequency: Every 1 minute
- Request timeout: 30 seconds
- Expected status code: `200`
- Locations: At least 2 different regions

#### Step 3: Configure Alerts

**Alert Channels:**

1. **Email Alerts** (Default)
   - Already configured with your account email
   - You'll receive immediate notifications

2. **Slack Integration** (Recommended)
   - Go to Integrations → Slack
   - Connect to your Slack workspace
   - Choose a channel (e.g., `#alerts` or `#xplorium-monitoring`)
   - Test the integration

3. **SMS Alerts** (Optional, Paid)
   - Available on paid plans
   - Add phone number in Better Uptime settings

**Alert Policy:**
- Send alert after: 1 failed check
- Confirm incident after: 2 failed checks (prevents false alarms)
- Escalation: After 15 minutes, send SMS (if configured)

#### Step 4: Create Status Page (Optional)

Better Uptime includes a public status page:

1. Go to Status Pages → Create
2. Configure:
   - Name: `Xplorium Status`
   - Custom domain: `status.xplorium.com` (optional)
   - Add all monitors
   - Enable incident history
   - Enable email subscriptions

3. Share status page URL with users

#### Step 5: Integration with GitHub

Better Uptime can post incidents to GitHub:

1. Go to Integrations → GitHub
2. Connect repository
3. Incidents will create GitHub issues automatically

---

## 4. Vercel Analytics ✅ ENABLED

**Status:** ✅ Already integrated

Vercel Analytics is already configured in your project:
- Package: `@vercel/analytics` (latest)
- Integration: Automatic via Vercel deployment

### Accessing Analytics

1. Go to Vercel Dashboard
2. Select Xplorium project
3. Click "Analytics" tab

**What to monitor:**
- Page views and unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM) data
- Geographic distribution

---

## 5. Logging Strategy 📋 CURRENT

**Status:** 📋 Using custom logger (lib/logger.ts)

### Current Logging

The project uses a custom logger (`lib/logger.ts`) with:
- ✅ Environment-aware logging (dev/prod/test)
- ✅ Specialized methods (auth, db, serverAction, api)
- ✅ Structured logging

### Optional: Logtail Integration

If you want centralized log aggregation:

#### Setup Logtail (Better Stack)

1. **Create Account**
   - Go to https://logs.betterstack.com
   - Sign up (free tier: 1GB/month)

2. **Create Source**
   - Click "Add source"
   - Select "Node.js"
   - Copy the source token

3. **Install Package**
```bash
npm install @logtail/node @logtail/winston winston
```

4. **Update lib/logger.ts**
```typescript
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import winston from 'winston';

const logtail = process.env.LOGTAIL_SOURCE_TOKEN
  ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
  : null;

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

if (logtail) {
  transports.push(new LogtailTransport(logtail));
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'xplorium-platform',
    environment: process.env.NODE_ENV,
  },
  transports,
});

// Keep existing helper methods...
```

5. **Add Environment Variable**
```bash
# .env.local and Vercel
LOGTAIL_SOURCE_TOKEN=your_token_here
```

---

## 6. Monitoring Checklist

### Immediate Setup (Week 5-6)

- [x] Configure Sentry for error tracking
- [x] Implement health check endpoint
- [x] Optimize Sentry configuration for production
- [ ] Create Better Uptime account
- [ ] Configure Better Uptime monitors (3 monitors)
- [ ] Set up Slack alerts for Better Uptime
- [ ] Test all monitoring endpoints

### Optional Enhancements

- [ ] Add Logtail for centralized logging
- [ ] Create public status page
- [ ] Set up SMS alerts (requires paid plan)
- [ ] Configure GitHub issue creation from incidents
- [ ] Add custom Sentry tags for better filtering

---

## 7. Testing Your Monitoring

### Test Sentry

```bash
# Trigger a test error
curl -X POST https://xplorium.com/api/sentry-test
```

Or create a test page and click a button that throws an error.

### Test Health Endpoint

```bash
# Should return 200 OK with healthy status
curl https://xplorium.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "version": "1.0.0",
#   "uptime": ...,
#   "checks": {
#     "database": {
#       "status": "up",
#       "latency": ...
#     }
#   }
# }
```

### Test Better Uptime

1. Stop your server temporarily
2. Wait 1-2 minutes
3. Check if you receive an alert
4. Restart server
5. Verify recovery notification

---

## 8. Monitoring Best Practices

### Error Tracking (Sentry)

- ✅ Only send errors in production (configured)
- ✅ Filter out warnings (configured)
- ✅ Use session replay for debugging
- 📝 Set up alert rules for critical errors
- 📝 Review and triage errors weekly

### Uptime Monitoring (Better Uptime)

- ✅ Monitor critical endpoints only (homepage, API, booking)
- ✅ Use 1-minute check frequency
- 📝 Set up multi-region checks
- 📝 Configure escalation policies
- 📝 Test failover scenarios monthly

### Logging

- ✅ Use structured logging (JSON format)
- ✅ Include context (user ID, request ID)
- ✅ Log errors with stack traces
- ⚠️ Never log sensitive data (passwords, tokens, PII)
- 📝 Set retention policies (7-30 days)

---

## 9. Alert Response Procedures

### When You Receive an Alert

1. **Assess Severity**
   - Critical: Total outage (respond immediately)
   - Warning: Degraded performance (respond within 1 hour)
   - Info: Monitoring notice (review next business day)

2. **Check Health Endpoint**
   ```bash
   curl https://xplorium.com/api/health
   ```

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Logs
   - Filter by time range
   - Look for errors

4. **Check Sentry**
   - Go to Sentry Dashboard
   - Check recent errors
   - Review session replays

5. **Fix and Verify**
   - Deploy fix if needed
   - Monitor for 15 minutes
   - Confirm recovery

6. **Document Incident**
   - Create GitHub issue
   - Document root cause
   - Add preventive measures

---

## 10. Cost Breakdown

### Current (Free Tier)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Sentry | Developer | $0 (5k events/month) |
| Better Uptime | Free | $0 (10 monitors) |
| Vercel Analytics | Hobby | $0 (included) |
| Logtail | Free | $0 (1GB/month) - Optional |
| **Total** | | **$0/month** |

### Recommended (Production)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Sentry | Team | $26 (50k events/month) |
| Better Uptime | Premium | $25 (50 monitors, SMS) |
| Vercel Analytics | Pro | Included with Vercel Pro |
| Logtail | Pro | $10 (5GB/month) |
| **Total** | | **$61/month** |

---

## 11. Next Steps

### This Week
1. [ ] Create Better Uptime account
2. [ ] Configure 3 monitors
3. [ ] Set up Slack integration
4. [ ] Test all endpoints
5. [ ] Document alert procedures

### Next Week
1. [ ] Review Sentry error trends
2. [ ] Optimize alert thresholds
3. [ ] Consider Logtail integration
4. [ ] Create status page (optional)

---

## 12. Resources

**Documentation:**
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Better Uptime Docs](https://docs.betteruptime.com)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Logtail Docs](https://betterstack.com/docs/logs/)

**Support:**
- Sentry Support: https://sentry.io/support/
- Better Uptime Support: support@betteruptime.com
- Vercel Support: https://vercel.com/support

---

**Last Updated:** 2025-12-11
**Owner:** DevOps Team
**Status:** Phase 3 In Progress
