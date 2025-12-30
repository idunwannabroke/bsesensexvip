// TickerBar component - Scrolling stock ticker with market data
// Used in: @/app/page.tsx (main layout)
// Links to: None (standalone component with animation)
'use client';

import React from 'react';

export function TickerBar() {
  const tickerData = [
    { name: 'SET', value: '1,287.44', change: '+2.63', percent: '+0.20%', isPositive: true },
    { name: 'MAI', value: '221.18', change: '-0.76', percent: '-0.34%', isPositive: false },
    { name: 'Dow Jones', value: '48,254.82', change: '+326.86', percent: '+0.68%', isPositive: true },
    { name: 'S&P 500', value: '6,850.92', change: '+4.31', percent: '+0.06%', isPositive: true },
    { name: 'FTSE 100', value: '9,845.97', change: '-65.45', percent: '-0.66%', isPositive: false },
    { name: 'MOEX Russia Index', value: '2,537.48', change: '+1.26', percent: '+0.05%', isPositive: true },
    { name: 'Nikkei 225', value: '51,281.83', change: '+218.52', percent: '+0.43%', isPositive: true },
    { name: 'SZSE Component', value: '13,476.52', change: '+235.91', percent: '+1.78%', isPositive: true },
    { name: 'Hang Seng', value: '27,073.03', change: '+150.30', percent: '+0.56%', isPositive: true },
    { name: 'KOSPI', value: '4,170.63', change: '+20.24', percent: '+0.49%', isPositive: true },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto">
        <div className="relative overflow-hidden h-10">
          <div className="absolute flex items-center gap-8 animate-scroll whitespace-nowrap h-full">
            {/* First set */}
            {tickerData.map((item, index) => (
              <div key={`first-${index}`} className="flex items-center gap-2 px-4 text-xs">
                <span className="font-medium text-black">{item.name}</span>
                <span className="text-black">{item.value}</span>
                <span className={item.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {item.change}
                </span>
                <span className={item.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {item.percent}
                </span>
              </div>
            ))}
            {/* Second set for seamless loop */}
            {tickerData.map((item, index) => (
              <div key={`second-${index}`} className="flex items-center gap-2 px-4 text-xs">
                <span className="font-medium text-black">{item.name}</span>
                <span className="text-black">{item.value}</span>
                <span className={item.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {item.change}
                </span>
                <span className={item.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {item.percent}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

