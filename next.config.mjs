import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSentryConfig(nextConfig, {
  // Upload source maps to Sentry (widens the set of files considered)
  widenClientFileUpload: true,

  // Do not expose source maps in the client bundle served to users
  hideSourceMaps: true,

  // Tree-shake the Sentry logger to reduce bundle size
  disableLogger: true,
});
