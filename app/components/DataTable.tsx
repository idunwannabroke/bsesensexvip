// DataTable component - Historical results table display with thick brand borders
'use client';

import React, { useState, useEffect } from 'react';
import { LotteryResultWithSession, MarketSession } from '@/lib/types';

// Type for grouped results by date
interface GroupedResult {
  date: string;
  sessions: Record<string, string>; // session_time -> top_number-bottom_number
}

// Helper component to render a single row of results
function ResultRow({ row, sessions }: { row: GroupedResult; sessions: MarketSession[] }) {
  return (
    <tr className="border-b-[2px] border-[#005a9e] last:border-b-0 hover:bg-gray-50 transition-colors">
      <td className="py-2 px-3 text-[13px] text-center border-r-[2px] border-[#005a9e] text-gray-700 font-bold whitespace-nowrap tabular-nums">
        {row.date}
      </td>
      {sessions.map((session, idx) => {
        const resultStr = row.sessions[session.session_time];
        let top = '-';
        let bottom = '-';

        if (resultStr && resultStr !== '-') {
          const delimiter = resultStr.includes('/') ? '/' : '-';
          const parts = resultStr.split(delimiter);
          if (parts.length === 2) {
            top = parts[0];
            bottom = parts[1];
          } else {
            top = resultStr;
          }
        }

        return (
          <React.Fragment key={session.id}>
            <td className="py-2 px-3 text-[13px] font-bold text-center border-r-[2px] border-[#005a9e] text-gray-800 tabular-nums">
              {top}
            </td>
            <td className={`py-2 px-3 text-[13px] font-bold text-center text-gray-800 tabular-nums ${idx === 0 ? 'border-r-[2px] border-[#005a9e]' : ''}`}>
              {bottom}
            </td>
          </React.Fragment>
        );
      })}
    </tr>
  );
}

export function DataTable() {
  const [tableData, setTableData] = useState<GroupedResult[]>([]);
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionsResponse = await fetch('/api/market-sessions', { cache: 'no-store' });
      const sessionsData = await sessionsResponse.json();

      if (sessionsData.success) {
        // Filter for specific session names as per original requirement
        const filteredSessions = sessionsData.data
          .filter((s: MarketSession) => s.session_name === 'เช้า' || s.session_name === 'บ่าย')
          .sort((a: MarketSession, b: MarketSession) => a.display_order - b.display_order);
        setSessions(filteredSessions);
      }

      const resultsResponse = await fetch('/api/lottery-results?limit=100', { cache: 'no-store' });
      const resultsData = await resultsResponse.json();

      if (resultsData.success) {
        const grouped: Record<string, Record<string, string>> = {};

        resultsData.data.forEach((result: LotteryResultWithSession) => {
          const rawDate = result.result_date;
          const [year, month, day] = rawDate.split('-');
          const formattedDate = `${day}/${month}/${year}`;

          if (!grouped[rawDate]) {
            grouped[rawDate] = {
              _displayDate: formattedDate,
            } as any;
          }
          grouped[rawDate][result.session_time] = `${result.top_number}-${result.bottom_number}`;
        });

        const groupedArray: GroupedResult[] = Object.entries(grouped)
          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
          .map(([rawDate, data]: [string, any]) => {
            const { _displayDate, ...sessionsMap } = data;
            return { date: _displayDate, sessions: sessionsMap };
          })
          .slice(0, 15);

        setTableData(groupedArray);
      }
    } catch (error) {
      console.error('Failed to load lottery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center text-[#005a9e] text-sm font-bold">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pb-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-4xl mx-auto border-[2px] border-[#005a9e] rounded-xl overflow-hidden shadow-lg">
          {/* Header Title */}
          <div className="bg-[#005a9e] py-3 px-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Result History</h2>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                {/* Main Header: Sessions */}
                <tr className="bg-[#f0f7ff] border-b-[2px] border-[#005a9e]">
                  <th rowSpan={2} className="py-2.5 px-3 text-[14px] font-bold text-[#005a9e] border-r-[2px] border-[#005a9e]">
                    Date
                  </th>
                  {sessions.map((s, idx) => (
                    <th key={`h-session-${s.id}`} colSpan={2} className={`py-2 px-3 text-[14px] font-bold text-[#005a9e] uppercase ${idx === 0 ? 'border-r-[2px] border-[#005a9e]' : ''}`}>
                      {s.session_name === 'เช้า' ? 'Morning' : 'Afternoon'}
                    </th>
                  ))}
                </tr>
                {/* Sub Header: Top/Bottom */}
                <tr className="bg-[#005a9e] border-b-[2px] border-[#005a9e]">
                  {sessions.map((s, idx) => (
                    <React.Fragment key={`h-sub-${s.id}`}>
                      <th className="py-1.5 px-3 text-[11px] font-bold text-white uppercase border-r-[2px] border-[#005a9e]">
                        Top
                      </th>
                      <th className={`py-1.5 px-3 text-[11px] font-bold text-white uppercase ${idx === 0 ? 'border-r-[2px] border-[#005a9e]' : ''}`}>
                        Bottom
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <ResultRow key={index} row={row} sessions={sessions} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400 font-bold">
                      NO DATA FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
