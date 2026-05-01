import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'pa'],
  defaultLocale: 'en',
  localeDetection: true
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
