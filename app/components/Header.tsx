// Header component - Two-tier navigation with search, auth, and mobile menu
// Used in: @/app/page.tsx (main layout)
// Links to: None (standalone component with lucide-react icons)
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Bell, Menu, X, Clock, Globe } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    'Markets',
    'Watchlist',
    'Crypto',
    'News',
    'Analysis',
    'Technical',
    'Charts',
    'Brokers',
    'Tools',
    'Education',
    'More',
  ];

  const popularItems = [
    'Markets',
    'Indices',
    'Futures',
    'Commodities',
    'Forex',
    'Screener',
    'Live Chart',
    'Calendar',
  ];

  return (
    <header className="bg-black text-white">
      {/* Top Bar */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-12 gap-2">
            {/* Logo with Image - Links to: /public/images/logo-header.png */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Image
                src="/images/logo-header.png"
                alt="BSESensexVip Logo"
                width={150}
                height={150}
                className="h-8 sm:h-8 w-auto"
                priority
                unoptimized
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">BSESensexVip</h1>
            </div>

            {/* Search Bar - Hidden on mobile/tablet */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-white text-black px-4 py-1.5 pr-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Right Side - Auth & Icons */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              {/* Auth Links - Hidden on mobile/tablet, shown on desktop only to avoid duplication */}
              <div className="hidden lg:flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                <button className="hover:text-gray-300 transition-colors">
                  Sign In
                </button>
                <span className="text-gray-500">/</span>
                <button className="hover:text-gray-300 transition-colors">
                  Sign Up
                </button>
              </div>

              {/* Icons - Shown on desktop only to avoid duplication with mobile bar */}
              <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
                <button className="hover:bg-white/10 p-1.5 rounded transition-colors text-gray-400">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="hover:bg-white/10 p-1.5 rounded transition-colors text-gray-400">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M20,6h-4V4c0-1.1-0.9-2-2-2h-4C8.9,2,8,2.9,8,4v2H4C2.9,6,2,6.9,2,8v11c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8 C22,6.9,21.1,6,20,6z M10,4h4v2h-4V4z M20,19H4V8h16V19z" />
                    </svg>
                  </div>
                </button>
                <button className="hover:bg-white/10 p-1.5 rounded transition-colors text-gray-400">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Language Icon - Replaced Thai flag with Globe icon for international look */}
              <button className="hidden lg:block hover:bg-white/10 p-1.5 rounded transition-colors flex-shrink-0">
                <Globe className="w-5 h-5 text-gray-400" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden hover:bg-white/10 p-1.5 rounded transition-colors flex-shrink-0"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Auth Bar - Below header */}
      <div className="lg:hidden border-b border-gray-700 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            {/* Auth Links */}
            <div className="flex items-center gap-2 text-sm">
              <button className="hover:text-gray-300 transition-colors font-medium">
                Sign In
              </button>
              <span className="text-gray-500">/</span>
              <button className="hover:text-gray-300 transition-colors font-medium">
                Sign Up
              </button>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button className="hover:bg-white/10 p-1.5 rounded transition-colors text-gray-400">
                <Bell className="w-5 h-5" />
              </button>
              <button className="hover:bg-white/10 p-1.5 rounded transition-colors text-gray-400">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M20,6h-4V4c0-1.1-0.9-2-2-2h-4C8.9,2,8,2.9,8,4v2H4C2.9,6,2,6.9,2,8v11c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8 C22,6.9,21.1,6,20,6z M10,4h4v2h-4V4z M20,19H4V8h16V19z" />
                  </svg>
                </div>
              </button>
              <button className="hover:bg-white/10 p-1.5 rounded transition-colors text-gray-400">
                <Clock className="w-5 h-5" />
              </button>
              <button className="hover:bg-white/10 p-1.5 rounded transition-colors flex-shrink-0">
                <Globe className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Desktop */}
      <div className="hidden lg:block border-b border-gray-700">
        <nav className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-12 overflow-x-auto no-scrollbar">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="text-sm font-bold whitespace-nowrap hover:text-gray-300 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Popular Sub-Navigation - Desktop */}
      <div className="hidden lg:block bg-[#f6f6f6] border-b border-[#e5e5e5]">
        <nav className="container mx-auto px-4">
          <div className="flex items-center h-9 overflow-x-auto no-scrollbar">
            <span className="text-[13px] font-bold text-[#666666] whitespace-nowrap mr-4">
              Popular:
            </span>
            <div className="flex items-center divide-x divide-[#e5e5e5]">
              {popularItems.map((item, index) => (
                <button
                  key={index}
                  className="px-4 text-[13px] text-[#333333] whitespace-nowrap hover:text-blue-600 transition-colors first:pl-0"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Extended Menu (Search & Navigation) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-700 bg-black">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-white text-black px-4 py-2 pr-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-3">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className="text-sm text-left hover:text-gray-300 transition-colors py-1"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
