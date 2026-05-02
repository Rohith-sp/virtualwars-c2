import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {};

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ WARNING: GEMINI_API_KEY is not set. The AI chat feature will not work.");
}

export default withSentryConfig(withNextIntl(nextConfig), {
  // Upload source maps to Sentry (widens the set of files considered)
  widenClientFileUpload: true,

  // Do not expose source maps in the client bundle served to users
  hideSourceMaps: true,

  // Tree-shake the Sentry logger to reduce bundle size
  disableLogger: true,
});
