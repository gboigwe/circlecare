import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'CircleCare - Collaborative Expense Management on Stacks',
    template: '%s | CircleCare',
  },
  description: 'Manage group expenses effortlessly with CircleCare. Built on Stacks Bitcoin L2, CircleCare helps communities track contributions, split costs, and build financial transparency through smart contracts.',
  keywords: ['expense management', 'group expenses', 'stacks', 'bitcoin', 'blockchain', 'smart contracts', 'community finance', 'expense splitting'],
  authors: [{ name: 'CircleCare Team' }],
  creator: 'CircleCare',
  publisher: 'CircleCare',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'CircleCare - Collaborative Expense Management on Stacks',
    description: 'Manage group expenses effortlessly with CircleCare. Built on Stacks Bitcoin L2 for transparent community finance.',
    siteName: 'CircleCare',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CircleCare - Collaborative Expense Management on Stacks',
    description: 'Manage group expenses effortlessly with CircleCare. Built on Stacks Bitcoin L2 for transparent community finance.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}