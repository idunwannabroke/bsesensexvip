'use client';

// AppPromotion component - Compact mobile app promotion section in English
import React from 'react';
import Image from 'next/image';

export function AppPromotion() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          {/* Top Row: Title and App Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Experience the app on your mobile</h2>
              <p className="text-gray-500 text-xs mb-4">Download the app for the best experience.</p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Image
                    src="/images/googleplay-th.png"
                    alt="Get it on Google Play"
                    width={110}
                    height={34}
                    className="h-8 w-auto object-contain"
                  />
                </a>

                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Image
                    src="/images/appstore-th.png"
                    alt="Download on the App Store"
                    width={110}
                    height={34}
                    className="h-8 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row: Links Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-2.5">
              <a href="#" onClick={handleClick} className="block text-[13px] text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-50 pb-1.5">Blog</a>
              <a href="#" onClick={handleClick} className="block text-[13px] text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-50 pb-1.5">Download App</a>
              <a href="#" onClick={handleClick} className="block text-[13px] text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-50 pb-1.5">Portfolio</a>
              <a href="#" onClick={handleClick} className="block text-[13px] text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-50 pb-1.5">Webmaster Tools</a>
            </div>
            <div className="space-y-2.5">
              <a href="#" onClick={handleClick} className="block text-[13px] text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-50 pb-1.5">About Us</a>
              <a href="#" onClick={handleClick} className="block text-[13px] text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-50 pb-1.5">Advertise</a>
              <a href="#" onClick={handleClick} className="block text-[13px] text-gray-600 hover:text-blue-600 transition-colors border-b border-gray-50 pb-1.5">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
