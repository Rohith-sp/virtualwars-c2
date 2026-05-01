import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 10% of transactions sent to Sentry — keeps costs low in production.
  tracesSampleRate: 0.1,

  // Disable in development to keep console clean.
  enabled: process.env.NODE_ENV === 'production',
});
