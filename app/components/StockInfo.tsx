// StockInfo component - Split into Summary and Chart for layout flexibility
// Used in: @/app/page.tsx (main layout)
'use client';

import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, ReferenceLine } from 'recharts';

// Shared data fetching logic could be moved to a hook if needed, 
// but for simplicity we'll keep them here or fetch independently.

export function StockInfoSummary() {
  const [currentTime, setCurrentTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [marketStatus, setMarketStatus] = useState('');
  const [sessionData, setSessionData] = useState<Array<{ session: string; time: string; up: string; down: string }>>([]);
  const [marketIndex, setMarketIndex] = useState({
    current_value: '84,929.36',
    change_value: '+447.55',
    change_percent: '0.53',
    is_positive: 1,
  });

  useEffect(() => {
    setIsMounted(true);
    loadMarketStatus();
    loadMarketIndex();
    loadTodayResults();

    const interval = setInterval(() => {
      loadMarketStatus();
      loadMarketIndex();
    }, 60000);

    const clockInterval = setInterval(() => {
      const now = new Date();
      const formattedDate = format(now, 'd MMMM yyyy');
      const formattedTime = format(now, 'HH:mm:ss');
      setCurrentTime(`Latest update: ${formattedDate} ${formattedTime}`);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  const loadMarketStatus = async () => {
    try {
      const response = await fetch('/api/market-sessions/status', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) setMarketStatus(data.data.statusText);
    } catch (error) { console.error(error); }
  };

  const loadMarketIndex = async () => {
    try {
      const response = await fetch('/api/market-index', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) setMarketIndex(data.data);
    } catch (error) { console.error(error); }
  };

  const loadTodayResults = async () => {
    try {
      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');
      const sessionsResponse = await fetch('/api/market-sessions', { cache: 'no-store' });
      const sessionsData = await sessionsResponse.json();
      if (!sessionsData.success) return;

      const resultsResponse = await fetch(`/api/lottery-results/by-date?date=${dateStr}`, { cache: 'no-store' });
      const resultsData = await resultsResponse.json();

      const sessions = sessionsData.data.map((session: any) => {
        const result = resultsData.success ? resultsData.data.find((r: any) => r.session_id === session.id) : null;
        let up = '-', down = '-';
        if (result) {
          if (result.top_number && result.top_number.includes('-')) {
            // Handle old combined format (XXX-XX)
            const parts = result.top_number.split('-');
            if (parts.length === 2) {
              [up, down] = parts;
            } else {
              up = result.top_number;
            }
          } else {
            // Handle new separate format
            up = result.top_number || '-';
            down = result.bottom_number || '-';
          }
        }
        return { session: session.session_name, time: session.session_time, up, down };
      });
      setSessionData(sessions);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Left - SET Index Information */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col items-start justify-center bg-white shadow-sm">
            <div className="flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 gap-y-1 mb-3">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums text-gray-900 tracking-tighter">
                {marketIndex.current_value}
              </span>
              <span className={`text-base sm:text-lg md:text-xl font-bold tabular-nums flex items-center gap-1 ${marketIndex.is_positive ? 'text-green-600' : 'text-red-600'}`}>
                {marketIndex.is_positive ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                {marketIndex.change_value} ({marketIndex.is_positive ? '+' : ''}{marketIndex.change_percent}%)
              </span>
            </div>

            <div className="w-full border-t border-dashed border-gray-300 my-2"></div>

            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-[11px] sm:text-[13px] tabular-nums" suppressHydrationWarning>
                {isMounted ? format(new Date(), 'HH:mm:ss') : '00:00:00'} {marketStatus || 'Market Closed'}
              </span>
            </div>
          </div>

          {/* Top Right - Market Session Data Table */}
          <div className="flex flex-col justify-center">
            <div className="border-[5px] border-[#005a9e] rounded-2xl overflow-hidden shadow-xl bg-[#005a9e]">
              <table className="w-full border-collapse">
                <tbody>
                  {sessionData.map((item, index) => (
                    <tr key={index} className={index === 0 ? 'border-b-[2px] border-white/40' : ''}>
                      <td className="py-3 px-2 sm:px-4 lg:px-2 xl:px-6 text-center border-r-[2px] border-white/40 text-base sm:text-xl lg:text-lg xl:text-xl font-bold text-white bg-[#005a9e] whitespace-nowrap">
                        {item.session === 'เช้า' || item.session === 'เปิดเช้า' ? 'Morning' :
                          item.session === 'บ่าย' || item.session === 'เปิดบ่าย' ? 'Afternoon' :
                            item.session === 'ปิดเที่ยง' ? 'Noon Close' :
                              item.session === 'ปิดเย็น' ? 'Evening Close' : item.session}
                      </td>
                      <td className="py-3 px-1 sm:px-3 lg:px-1 xl:px-3 text-center border-r-[2px] border-white/40 text-sm sm:text-lg lg:text-base xl:text-lg text-white/90 font-medium">Top</td>
                      <td className="py-3 px-2 sm:px-4 lg:px-2 xl:px-6 text-center border-r-[2px] border-white/40 text-2xl sm:text-4xl lg:text-3xl xl:text-4xl font-black text-white tabular-nums tracking-tighter">{item.up}</td>
                      <td className="py-3 px-1 sm:px-3 lg:px-1 xl:px-3 text-center border-r-[2px] border-white/40 text-sm sm:text-lg lg:text-base xl:text-lg text-white/90 font-medium">Bottom</td>
                      <td className="py-3 px-2 sm:px-4 lg:px-2 xl:px-6 text-center text-2xl sm:text-4xl lg:text-3xl xl:text-4xl font-black text-white tabular-nums tracking-tighter">{item.down}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StockInfoChart() {
  const [marketIndex, setMarketIndex] = useState({
    current_value: '84,929.36',
    change_value: '+447.55',
    change_percent: '0.53',
    is_positive: 1,
  });

  useEffect(() => {
    const loadMarketIndex = async () => {
      try {
        const response = await fetch('/api/market-index', { cache: 'no-store' });
        const data = await response.json();
        if (data.success) setMarketIndex(data.data);
      } catch (error) { console.error(error); }
    };
    loadMarketIndex();
    const interval = setInterval(loadMarketIndex, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="w-full h-[320px] sm:h-[420px]">
          <ChartComponent marketIndex={marketIndex} />
        </div>
      </div>
    </div>
  );
}

// Keep the internal components for the chart
const ChartComponent = memo(function ChartComponent({ marketIndex }: { marketIndex: any }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    setIsMounted(true);
  }, []);

  const chartData = React.useMemo(() => {
    if (!currentDate) return [];
    const data = [];
    const baseValue = 1500;
    const dataPoints = 40;
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (dataPoints - i - 1));
      const isLastPoint = (i === dataPoints - 1);
      if (!isLastPoint && (date.getDay() === 0 || date.getDay() === 6)) continue;
      const wave1 = Math.sin(i / 1.5) * 150;
      const wave2 = Math.cos(i / 0.8) * 100;
      const sharpNoise = (Math.random() - 0.5) * 200;
      const value = baseValue + wave1 + wave2 + sharpNoise;
      const volume = Math.floor(Math.random() * 900) + 100;
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        volume: volume,
        fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        displayDate: i % 8 === 0 ? format(date, 'MMM yy') : ''
      });
    }
    return data;
  }, [currentDate, selectedTimeframe]);

  return (
    <div className="bg-white h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="border-b border-gray-100 bg-white overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-6 py-2 px-3 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth">
          {['General', 'Charts', 'News & Analysis', 'Technical', 'Forums'].map((tab) => (
            <button key={tab} className={`text-[12px] sm:text-[13px] whitespace-nowrap transition-all pb-1 relative font-bold flex-shrink-0 ${tab === 'General' ? 'text-blue-700' : 'text-gray-500 hover:text-blue-500'}`}>
              {tab}
              {tab === 'General' && <div className="absolute bottom-0 left-0 right-0 h-[2px] sm:h-[3px] bg-blue-700 rounded-full" />}
            </button>
          ))}
        </div>
      </div>
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-gray-400 font-medium bg-white border-b border-gray-50 overflow-x-auto no-scrollbar whitespace-nowrap">
        {['Overview', 'Components', 'Historical Data', 'Related Instruments'].map((sub) => (
          <span key={sub} onClick={() => setActiveSubTab(sub)} className={`cursor-pointer transition-colors flex-shrink-0 ${sub === activeSubTab ? 'text-blue-600 font-bold' : 'hover:text-blue-500'}`}>{sub}</span>
        ))}
      </div>
      <div className="flex items-center gap-x-2 sm:gap-x-3 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-gray-100 bg-white overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-1.5 pr-2 sm:pr-3 border-r border-gray-100 flex-shrink-0">
          <div className="p-1 sm:p-1.5 hover:bg-gray-50 rounded cursor-pointer"><svg className="w-3.5 h-3.5 sm:w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h3v14h-3V5zM5 8h3v10H5V8zm5.5-3h3v16h-3V5z" /></svg></div>
          <div className="p-1 sm:p-1.5 bg-blue-50 text-blue-600 rounded cursor-pointer border border-blue-100"><svg className="w-3.5 h-3.5 sm:w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 17l6-6 4 4 8-8" /></svg></div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-grow">
          {['5', '15', '30', '1H', '5H', '1D', '1W', '1M'].map((tf) => (
            <button key={tf} onClick={() => setSelectedTimeframe(tf)} className={`min-w-[24px] sm:min-w-[28px] px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-bold transition-colors flex-shrink-0 ${tf === selectedTimeframe ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-gray-50'}`}>{tf}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white relative flex flex-col p-2 sm:p-3 min-h-0">
        <div className="mb-1 sm:mb-2 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">BSE Sensex 30 VIP</h2>
            <div className="flex items-baseline gap-2 font-bold">
              <span className="text-xl sm:text-2xl tabular-nums font-bold tracking-tight text-gray-900">{marketIndex.current_value}</span>
              <span className={`text-xs sm:text-sm tabular-nums font-medium flex items-center gap-1 ${marketIndex.is_positive ? 'text-green-600' : 'text-red-600'}`}>
                {marketIndex.is_positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {marketIndex.is_positive ? '+' : ''}{marketIndex.change_value} ({marketIndex.is_positive ? '+' : ''}{marketIndex.change_percent}%)
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative mt-1 sm:mt-2">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none text-5xl sm:text-8xl font-black italic whitespace-nowrap">BSE SENSEX</div>
          {isMounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="1 1" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} dy={10} padding={{ left: 0, right: 0 }} />
                <YAxis orientation="right" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={40} />
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold', padding: '8px' }} formatter={(value: number) => [value.toLocaleString(), 'Index']} />
                <ReferenceLine y={parseFloat(marketIndex.current_value.replace(/,/g, ''))} stroke="#1f2937" strokeDasharray="3 3" label={{ position: 'insideRight', value: marketIndex.current_value, fill: '#1f2937', fontSize: 9, fontWeight: 'bold', dy: -10 }} />
                <Area type="linear" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} fill="url(#chartFill)" dot={false} activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} animationDuration={1500} />
                <Bar dataKey="volume" fill="#e2e8f0" yAxisId={0} opacity={0.4} barSize={4} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold">Loading Data...</div>}
        </div>
      </div>
      <div className="bg-white border-t border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
        <table className="w-full text-center border-collapse min-w-[600px] sm:min-w-0">
          <thead>
            <tr className="bg-white border-b border-gray-50">
              {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'Max'].map((h) => (
                <th key={h} className="py-2 px-1 text-[9px] sm:text-[10px] font-bold text-gray-400 border-r border-gray-50 last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {[
                { val: '+0.62%', pos: true }, { val: '-0.40%', pos: false }, { val: '-0.82%', pos: false }, { val: '+2.79%', pos: true },
                { val: '+3.06%', pos: true }, { val: '+8.83%', pos: true }, { val: '+80.85%', pos: true }, { val: '+68.31K%', pos: true }
              ].map((item, i) => (
                <td key={i} className={`py-2 px-1 text-[10px] sm:text-[11px] font-bold border-r border-gray-50 last:border-r-0 ${item.pos ? 'text-green-600' : 'text-red-500'}`}>{item.val}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

// For backward compatibility if needed, but we'll use the two new components
export function StockInfo() {
  return (
    <>
      <StockInfoSummary />
      <StockInfoChart />
    </>
  );
}
