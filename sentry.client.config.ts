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

  // Session Replay - capture errors in production, limited sessions in development
  replaysOnErrorSampleRate: 1.0, // Always capture replay when error occurs
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Privacy: mask all text content
      blockAllMedia: true, // Privacy: block images/videos
    }),
  ],

  // Filter out low-priority errors
  beforeSend(event, hint) {
    // Don't send warnings in production
    if (event.level === 'warning' && process.env.NODE_ENV === 'production') {
      return null;
    }
    return event;
  },
});
