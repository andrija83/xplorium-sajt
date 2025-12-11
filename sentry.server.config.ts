import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment detection
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  // Sample 10% in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Debug mode only in development
  debug: process.env.NODE_ENV === 'development',

  // Filter out low-priority errors
  beforeSend(event, hint) {
    // Don't send warnings in production
    if (event.level === 'warning' && process.env.NODE_ENV === 'production') {
      return null;
    }
    return event;
  },
});
