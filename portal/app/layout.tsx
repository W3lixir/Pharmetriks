import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RXaudit — Offline pharmacy audit tool',
  description:
    'Track dispensing, inventory, and OPEX for your pharmacy. Works offline. ₱249 one-time, lifetime access.',
  applicationName: 'RXaudit',
  appleWebApp: {
    capable: true,
    title: 'RXaudit',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/apple-touch-icon.svg' }],
    other: [{ rel: 'mask-icon', url: '/icons/icon-monochrome.svg', color: '#0033FF' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0033FF' },
    { media: '(prefers-color-scheme: dark)',  color: '#00003D' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
