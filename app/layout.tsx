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
  metadataBase: new URL('https://www.thaitaevip.com'),
  title: {
    default: 'BSESensexVip - ข้อมูลตลาดหุ้น ข่าวสาร และการวิเคราะห์',
    template: '%s | BSESensexVip'
  },
  description: 'ราคาหุ้นวันนี้ ผลหวย ดัชนี SET Index ข่าวตลาดหุ้น บทวิเคราะห์ แนวทาง การเงิน ในรูปแบบต่างๆ',
  keywords: ['ผลหวย', 'หวยBSESensexVip', 'BSESensexVip', 'ผลหวยย้อนหลัง', 'ตลาดหุ้น', 'SET Index', 'หุ้นไทย', 'ข่าวการเงิน', 'แผนภูมิหุ้น', 'วิเคราะห์หุ้น', 'ตลาดทุน'],
  authors: [{ name: 'BSESensexVip' }],
  creator: 'BSESensexVip',
  publisher: 'BSESensexVip',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://www.thaitaevip.com',
    siteName: 'BSESensexVip',
    title: 'BSESensexVip - ข้อมูลตลาดหุ้น ข่าวสาร และการวิเคราะห์',
    description: 'ราคาหุ้นวันนี้ ผลหวย ดัชนี SET Index ข่าวตลาดหุ้น บทวิเคราะห์ แนวทาง การเงิน ในรูปแบบต่างๆ',
    images: [
      {
        url: '/images/logo-header.png',
        width: 1200,
        height: 630,
        alt: 'BSESensexVip - ผลหวยและข้อมูลตลาดหุ้น',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BSESensexVip - ข้อมูลตลาดหุ้น ข่าวสาร และการวิเคราะห์',
    description: 'ราคาหุ้นวันนี้ ผลหวย ดัชนี SET Index ข่าวตลาดหุ้น บทวิเคราะห์ แนวทาง การเงิน ในรูปแบบต่างๆ',
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
    url: 'https://www.thaitaevip.com',
    description: 'ราคาหุ้นวันนี้ ผลหวย ดัชนี SET Index ข่าวตลาดหุ้น บทวิเคราะห์ แนวทาง การเงิน',
    inLanguage: 'th-TH',
    publisher: {
      '@type': 'Organization',
      name: 'BSESensexVip',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.thaitaevip.com/images/logo-header.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.thaitaevip.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="th">
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
