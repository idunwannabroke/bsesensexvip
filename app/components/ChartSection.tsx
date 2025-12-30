// ChartSection component - Compact chart display embedded in StockInfo layout
// Used in: @/app/page.tsx (main layout) - positioned in bottom right of StockInfo section
// Links to: recharts library for chart rendering
'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ChartSection() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  const tabs = [
    'ทั่วไป',
    'กราฟ',
    'ข่าว & บทวิเคราะห์',
    'ทางเทคนิค',
    'กระทู้สนทนา',
  ];

  const subNavItems = ['ภาพรวม', 'องค์ประกอบ', 'ราคาย้อนหลัง'];

  // Generate realistic stock data
  const generateChartData = () => {
    const data = [];
    const baseValue = 1600;
    const dataPoints = 20;
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(2025, 10, 12 - (dataPoints - i - 1));
      const randomChange = (Math.random() - 0.5) * 200;
      const value = baseValue + randomChange + Math.sin(i / 3) * 150;
      
      data.push({
        date: date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' }),
        value: Math.round(value),
        fullDate: date.toLocaleDateString('th-TH', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        {/* Main Tabs Navigation */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-1 mb-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`text-sm whitespace-nowrap border-b-2 pb-1 -mb-1 ${
                tab === 'ทั่วไป'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-blue-600'
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1 mb-2">
          {subNavItems.map((item, index) => (
            <React.Fragment key={item}>
              <div
                className={`text-sm border-b-2 pb-1 -mb-1 ${
                  item === 'ภาพรวม'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-blue-600'
                }`}
              >
                {item}
              </div>
              {index < subNavItems.length - 1 && (
                <span className="text-gray-400">|</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Section Title */}
        <h2 className="text-lg font-bold text-black mb-2">ภาพรวมของ SET</h2>

        {/* Compact Chart container */}
        <div className="border border-gray-300 rounded overflow-hidden">
          {/* Chart header with compact timeframe buttons */}
          <div className="flex items-center justify-between border-b border-gray-300 px-2 py-1 bg-gray-50">
            <div className="flex items-center">
              {['1', '5', '15', '30', '1H', '5H', '1D', '1W', '1M'].map((timeframe, index) => (
                <React.Fragment key={timeframe}>
                  {index > 0 && (
                    <div className="h-4 w-px bg-gray-300"></div>
                  )}
                  <button
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-1.5 py-0.5 text-[10px] whitespace-nowrap transition-colors focus:outline-none ${
                      timeframe === selectedTimeframe
                        ? 'text-blue-600 font-semibold bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {timeframe}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div className="text-[10px] text-blue-600 hover:underline cursor-pointer">
              กราฟทางเทคนิค
            </div>
          </div>
          
          {/* Compact Chart area - Fixed height container for ResponsiveContainer SSR compatibility */}
          <div className="w-full bg-white p-2 focus:outline-none" style={{ height: '192px' }} tabIndex={-1}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 9 }}
                  stroke="#9ca3af"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 9 }}
                  stroke="#9ca3af"
                  domain={[1000, 2000]}
                  ticks={[1000, 1500, 2000]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '10px',
                    padding: '4px 8px'
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'ราคา']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

