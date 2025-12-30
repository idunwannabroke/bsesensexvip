import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bsesensexvip.com'),
  title: {
    default: 'BSESensexVip - BSE Sensex 30 Market Data, News & Analysis',
    template: '%s | BSESensexVip'
  },
  description: 'Real-time BSE Sensex 30 index, market results, stock news, technical analysis, and financial insights. Track Indian market performance on BSESensexVip.',
  keywords: [
    'BSE Sensex 30',
    'BSESensexVip',
    'BSE Sensex Today',
    'Indian Stock Market',
    'Sensex News',
    'Market Analysis',
    'Financial News',
    'Stock Charts',
    'Technical Analysis',
    'BSE Results'
  ],
  authors: [{ name: 'BSESensexVip' }],
  creator: 'BSESensexVip',
  publisher: 'BSESensexVip',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.bsesensexvip.com',
    siteName: 'BSESensexVip',
    title: 'BSESensexVip - BSE Sensex 30 Market Data, News & Analysis',
    description: 'Get real-time BSE Sensex 30 updates, stock market news, and expert analysis on BSESensexVip.',
    images: [
      {
        url: '/images/logo-header.png',
        width: 1200,
        height: 630,
        alt: 'BSESensexVip Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BSESensexVip - BSE Sensex 30 Market Data, News & Analysis',
    description: 'Real-time BSE Sensex 30 updates and Indian stock market analysis.',
    images: ['/images/logo-header.png'],
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
    // Add later: google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BSESensexVip',
    url: 'https://www.bsesensexvip.com',
    description: 'BSE Sensex 30 Market Data, News & Analysis',
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'BSESensexVip',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.bsesensexvip.com/images/logo-header.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.bsesensexvip.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
