// TopLayout component - BSE Sensex 30 mock card and promotional image
// Used in: @/app/page.tsx (main layout)
// Links to: None (mock data for display)
'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Bell, Info } from 'lucide-react';

export function TopLayout() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left: BSE Sensex 30 Mock Card */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col items-center justify-center min-h-[160px]">
            <div className="w-full max-w-md">
              {/* Title */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">BSE Sensex 30 (BSESN) VIP</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Market Details */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-4 bg-gradient-to-b from-orange-500 via-white to-green-600 rounded-sm shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#005a9e] rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600">BSE Currency: INR</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button className="bg-[#005a9e] hover:bg-[#004d87] text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                  <Star className="w-4 h-4" />
                  <span>Add to Portfolio</span>
                </button>
                <button className="w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center relative">
                  <Bell className="w-4 h-4 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#005a9e] rounded-full"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="flex items-center justify-center">
            <div className="w-full h-full min-h-[160px] relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/S__7446565.jpg"
                alt="BSESensexVip"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

