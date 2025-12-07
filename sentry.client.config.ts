import * as Sentry from "@sentry/nextjs";

console.log('=== SENTRY CLIENT INIT ===')
console.log('DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN?.substring(0, 30) + '...')
console.log('Enabled:', process.env.NODE_ENV === 'production' || true)

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true, // Enable debug logging to troubleshoot

  // TEMPORARY: Enable in all environments for testing
  // Change back to: process.env.NODE_ENV === 'production' after confirming it works
  enabled: true,

  // Replay on error only to save quota
  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
