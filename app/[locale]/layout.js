import Script from 'next/script';
import SkipLink from '@/components/SkipLink';
import Toast from '@/components/Toast';
import FirebaseAnalyticsProvider from '@/components/FirebaseAnalyticsProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const title = t.has('title') ? t('title') : 'VoteGuide India - AI Voter Assistant';
  const description = t.has('description')
    ? t('description')
    : 'Interactive guide to Indian elections. Chat with AI, find polling booths, and navigate voter registration forms easily.';

  return {
    title,
    description,
    keywords: 'India elections, Voter registration, Form 6, EPIC card, Polling booth, ECI',
    openGraph: {
      title, description, url: 'https://voteguide.in',
      siteName: 'VoteGuide India', locale, type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    metadataBase: new URL('https://voteguide.in'),
  };
}

export const viewport = { width: 'device-width', initialScale: 1 };

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Locale layout — sets lang attribute on <html> and wraps children with
 * NextIntlClientProvider. Does NOT re-render <html>/<body> (those are in app/layout.js).
 */
export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages();

  return (
    <>
      {/* Update the lang attribute server-side via suppressHydrationWarning on root */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = "${locale}"; document.documentElement.setAttribute('data-locale', '${locale}');`,
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <SkipLink />
        <Toast />
        <FirebaseAnalyticsProvider />
        {children}
      </NextIntlClientProvider>

      {GA_ID && (
        <>
          <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: true });
          `}</Script>
        </>
      )}
    </>
  );
}
