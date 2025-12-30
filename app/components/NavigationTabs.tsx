// NavigationTabs component - Secondary navigation tabs below stock info
// Used in: @/app/page.tsx (main layout)
// Links to: None (standalone component)
import React from 'react';

export function NavigationTabs() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 h-12 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-4 w-24 bg-gray-200 rounded flex-shrink-0"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

