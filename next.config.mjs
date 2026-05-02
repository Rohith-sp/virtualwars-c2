import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel handles image optimization natively
  images: {
    unoptimized: false,
  },
};

export default withNextIntl(nextConfig);
