import { 
  Playfair_Display, DM_Sans, JetBrains_Mono,
  Tiro_Devanagari_Hindi, Noto_Sans_Bengali, Noto_Sans_Telugu,
  Noto_Sans_Tamil, Noto_Sans_Gujarati, Noto_Sans_Kannada, Noto_Sans_Gurmukhi
} from 'next/font/google';
import Script from 'next/script';
import SkipLink from '@/components/SkipLink';
import Toast from '@/components/Toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '../globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const tiroHindi = Tiro_Devanagari_Hindi({ weight: '400', subsets: ['devanagari'], variable: '--font-hi', display: 'swap' });
const notoBn = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--font-bn', display: 'swap' });
const notoTe = Noto_Sans_Telugu({ subsets: ['telugu'], variable: '--font-te', display: 'swap' });
const notoTa = Noto_Sans_Tamil({ subsets: ['tamil'], variable: '--font-ta', display: 'swap' });
const notoGu = Noto_Sans_Gujarati({ subsets: ['gujarati'], variable: '--font-gu', display: 'swap' });
const notoKn = Noto_Sans_Kannada({ subsets: ['kannada'], variable: '--font-kn', display: 'swap' });
const notoPa = Noto_Sans_Gurmukhi({ subsets: ['gurmukhi'], variable: '--font-pa', display: 'swap' });

const fontVariables = `${playfair.variable} ${dmSans.variable} ${jetBrainsMono.variable} ${tiroHindi.variable} ${notoBn.variable} ${notoTe.variable} ${notoTa.variable} ${notoGu.variable} ${notoKn.variable} ${notoPa.variable}`;

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: 'India elections, Voter registration, Form 6, EPIC card, Polling booth, ECI',
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default async function RootLayout({ children, params: { locale } }) {
  const messages = await getMessages();

  return (
    <html lang={locale} data-locale={locale}>
      <body className={fontVariables}>
        <NextIntlClientProvider messages={messages}>
          <SkipLink />
          <Toast />
          {children}

        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: true });
              `}
            </Script>
          </>
        )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
