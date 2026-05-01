import { Playfair_Display, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import SkipLink from '@/components/SkipLink';
import './globals.css';

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

export const metadata = {
  title: 'VoteGuide India — Your Complete Voter Information Assistant',
  description:
    'Understand voter registration (Form 6), corrections (Form 8), deletions (Form 7), transpositions (Form 8A), and how to vote in India. Powered by AI and the Election Commission of India.',
  keywords: 'India elections, Voter registration, Form 6, EPIC card, Polling booth, ECI, Election Commission of India, Voting guide',
  authors: [{ name: 'VoteGuide India Team' }],
  openGraph: {
    title: 'VoteGuide India — Empowering Every Voter',
    description: 'AI-powered guide to Indian elections. Register, find your booth, and know your rights.',
    url: 'https://voteguide.in', // Placeholder
    siteName: 'VoteGuide India',
    images: [
      {
        url: '/og-image.png', // Placeholder
        width: 1200,
        height: 630,
        alt: 'VoteGuide India Dashboard',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoteGuide India — Empowering Every Voter',
    description: 'AI-powered guide to Indian elections. Register, find your booth, and know your rights.',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <SkipLink />
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
      </body>
    </html>
  );
}
