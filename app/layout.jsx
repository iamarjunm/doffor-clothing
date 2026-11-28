import { Inter, Space_Grotesk, Oswald } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Providers from '../components/Providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-condensed',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export const metadata = {
  title: 'DOFFOR — Heavyweight Streetwear & Archive Clothing',
  description:
    'Doffor Clothing. Heavyweight 240–280 GSM oversized tees, archival full-sleeves, and boxy muscle tanks. Crafted in India.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable} ${oswald.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-white text-[#0B0B0C] font-sans antialiased selection:bg-[#0B0B0C] selection:text-white min-h-screen flex flex-col"
      >
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
