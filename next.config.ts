// Next.js configuration for image optimization and external image sources
// Links to: @/app/components/Header.tsx (uses external logo from www.spcset.com)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone output for Docker deployment
  // Disable SWC minification to prevent Recharts/Next.js 16 issues with class properties (reading 'aa')
  experimental: {
    // optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Ensure native modules are handled correctly
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.spcset.com',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 's0.2mdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hqgrshroizszfphxqnbv.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i-invdn-com.investing.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
