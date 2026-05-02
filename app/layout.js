import {
  Playfair_Display, DM_Sans, JetBrains_Mono,
  Tiro_Devanagari_Hindi, Noto_Sans_Bengali, Noto_Sans_Telugu,
  Noto_Sans_Tamil, Noto_Sans_Gujarati, Noto_Sans_Kannada, Noto_Sans_Gurmukhi
} from 'next/font/google';
import './globals.css';

const playfair      = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const dmSans        = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const tiroHindi     = Tiro_Devanagari_Hindi({ weight: '400', subsets: ['devanagari'], variable: '--font-hi', display: 'swap' });
const notoBn        = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--font-bn', display: 'swap' });
const notoTe        = Noto_Sans_Telugu({ subsets: ['telugu'], variable: '--font-te', display: 'swap' });
const notoTa        = Noto_Sans_Tamil({ subsets: ['tamil'], variable: '--font-ta', display: 'swap' });
const notoGu        = Noto_Sans_Gujarati({ subsets: ['gujarati'], variable: '--font-gu', display: 'swap' });
const notoKn        = Noto_Sans_Kannada({ subsets: ['kannada'], variable: '--font-kn', display: 'swap' });
const notoPa        = Noto_Sans_Gurmukhi({ subsets: ['gurmukhi'], variable: '--font-pa', display: 'swap' });

const fontVariables = [
  playfair.variable, dmSans.variable, jetBrainsMono.variable,
  tiroHindi.variable, notoBn.variable, notoTe.variable,
  notoTa.variable, notoGu.variable, notoKn.variable, notoPa.variable,
].join(' ');

/**
 * Root layout — owns <html> and <body> as required by Next.js App Router.
 * The locale-specific <html lang> attribute is set via suppressHydrationWarning
 * so that app/[locale]/layout.js can update it server-side without a mismatch.
 */
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body className={fontVariables} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
