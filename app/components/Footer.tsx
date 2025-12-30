/**
 * [PURPOSE] Site footer with logo, copyright, and risk disclosure, following Investing.com design exactly.
 * [FLOW] UI Component -> Static render
 * [LINKS]
 * - Used By: @/app/layout.tsx
 */
'use client';

import React from 'react';
import Image from 'next/image';
import { Facebook, Twitter, MessageSquare } from 'lucide-react';

export function Footer() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  };

  return (
    <footer className="bg-[#121212] text-[#999999] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Section: Logo and Social Media */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-[#222222] pb-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Image
              src="/images/logo-header.png"
              alt="BSESensexVip Logo"
              width={150}
              height={150}
              className="h-8 w-auto"
              unoptimized
            />
            <span className="text-2xl font-bold text-white">BSESensexVip</span>
          </div>

          <div className="flex items-center gap-4 text-white">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-blue-400 transition-colors" />
            <MessageSquare className="w-5 h-5 cursor-pointer hover:text-green-500 transition-colors" />
          </div>
        </div>

        {/* Middle Section: Risk Disclosure (Plain text) */}
        <div className="text-[12px] leading-relaxed text-[#888888] space-y-4 mb-8">
          <p>
            Risk Disclosure: Trading in financial instruments and/or cryptocurrencies involves high risks including the risk of losing some, or all, of your investment amount, and may not be suitable for all investors. Prices of cryptocurrencies are extremely volatile and may be affected by external factors such as financial, regulatory or political events. Trading on margin increases the financial risks.
            Before deciding to trade in financial instrument or cryptocurrencies you should be fully informed of the risks and costs associated with trading the financial markets, carefully consider your investment objectives, level of experience, and risk appetite, and seek professional advice where needed.
          </p>

          <p>
            Fusion Media would like to remind you that the data contained in this website is not necessarily real-time nor accurate. The data and prices on the website are not necessarily provided by any market or exchange, but may be provided by market makers, and so prices may not be accurate and may differ from the actual price at any given market, meaning prices are indicative and not appropriate for trading purposes. Fusion Media and any provider of the data contained in this website will not accept liability for any loss or damage as a result of your trading, or your reliance on the information contained within this website.
          </p>

          <p>
            It is prohibited to use, store, reproduce, display, modify, transmit or distribute the data contained in this website without the explicit prior written permission of Fusion Media and/or the data provider. All intellectual property rights are reserved by the providers and/or the exchange providing the data contained in this website.
          </p>

          <p>
            Fusion Media may be compensated by the advertisers that appear on the website, based on your interaction with the advertisements or advertisers.
          </p>

          <p>
            The English version of this agreement is the prevailing version, which shall prevail whenever there is any discrepancy between the English version and the Thai version.
          </p>
        </div>

        {/* Lower Navigation Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-medium text-[#cccccc] mb-8 border-t border-[#222222] pt-6">
          <a href="#" onClick={handleClick} className="hover:text-white transition-colors">Terms and Conditions</a>
          <span className="text-[#333333]">|</span>
          <a href="#" onClick={handleClick} className="hover:text-white transition-colors">Privacy Policy</a>
          <span className="text-[#333333]">|</span>
          <a href="#" onClick={handleClick} className="hover:text-white transition-colors">Risk Warning</a>
        </div>

        {/* Bottom Section: Final Copyright */}
        <div className="border-t border-[#222222] pt-6 flex justify-between items-center">
          <p className="text-[12px] text-[#666666]">
            © 2007-{new Date().getFullYear()} Fusion Media Limited. All Rights Reserved.
          </p>
          <div className="flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
