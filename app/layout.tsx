// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './auth/clerk-provider';
import { ErrorBoundary } from './lib/errors/ErrorBoundary';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AirXpress - Express Air Shipping to the Caribbean',
  description: 'Fast, reliable air shipping from New Jersey to Guyana, Trinidad, Jamaica, Barbados, and Puerto Rico.',
  keywords: 'air shipping, Caribbean shipping, express shipping, Guyana shipping, Trinidad shipping',
  authors: [{ name: 'AirXpress LLC' }],
  openGraph: {
    title: 'AirXpress - Express Air Shipping to the Caribbean',
    description: 'Fast, reliable air shipping from New Jersey to the Caribbean',
    url: 'https://airxpress.com',
    siteName: 'AirXpress',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AirXpress - Express Air Shipping to the Caribbean',
    description: 'Fast, reliable air shipping from New Jersey to the Caribbean',
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
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <html lang="en" className="h-full">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={`${inter.className} min-h-full bg-gray-50`}>
          <ErrorBoundary>
            <div id="root">
              {children}
            </div>
          </ErrorBoundary>
        </body>
      </html>
    </Providers>
  );
}
