/**
 * [PURPOSE] Admin sessions management page for configuring market open/close times and status.
 * [FLOW] UI -> API (@/api/market-sessions) -> Database
 * [LINKS]
 * - Calls: @/app/api/market-sessions/route.ts
 * - Calls: @/app/api/market-sessions/[id]/route.ts
 * - Types: @/lib/types.ts
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketSession } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function SessionsManagementPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [editingSession, setEditingSession] = useState<MarketSession | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verify authentication
  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        setIsAuthenticated(true);
        loadSessions();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Load market sessions
  const loadSessions = async () => {
    try {
      const response = await fetch('/api/market-sessions');
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Handle edit
  const handleEdit = (session: MarketSession) => {
    setEditingSession({ ...session });
    setMessage(null);
  };

  // Handle save
  const handleSave = async () => {
    if (!editingSession) return;

    try {
      const response = await fetch(`/api/market-sessions/${editingSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_name: editingSession.session_name,
          session_time: editingSession.session_time,
          is_market_open: editingSession.is_market_open,
          display_order: editingSession.display_order,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'บันทึกสำเร็จ' });
        setEditingSession(null);
        loadSessions();
      } else {
        setMessage({ type: 'error', text: data.error || 'บันทึกไม่สำเร็จ' });
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึก' });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingSession(null);
    setMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 font-medium">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-800 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => router.push('/admin')}>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold leading-none">จัดการรอบเวลา</h1>
                <span className="text-[10px] sm:text-xs text-blue-400 font-medium tracking-wider uppercase">Market Sessions</span>
              </div>
            </div>

            <Button
              onClick={() => router.push('/admin')}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              ← กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg shadow-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop View (Table) */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รอบ</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">เวลา</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะตลาด</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ลำดับ</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      {editingSession?.id === session.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editingSession.session_name}
                              onChange={(e) => setEditingSession({ ...editingSession, session_name: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="time"
                              value={editingSession.session_time}
                              onChange={(e) => setEditingSession({ ...editingSession, session_time: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editingSession.is_market_open}
                              onChange={(e) => setEditingSession({ ...editingSession, is_market_open: parseInt(e.target.value) })}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value={1}>ตลาดเปิด</option>
                              <option value={0}>ตลาดปิด</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editingSession.display_order}
                              onChange={(e) => setEditingSession({ ...editingSession, display_order: parseInt(e.target.value) })}
                              className="w-20 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={handleSave}
                                className="text-green-600 hover:text-green-700 font-bold text-sm"
                              >
                                บันทึก
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700 font-bold text-sm"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold">{session.session_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-mono">{session.session_time}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${session.is_market_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {session.is_market_open ? 'ตลาดเปิด' : 'ตลาดปิด'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-medium">{session.display_order}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEdit(session)}
                              className="text-blue-600 hover:text-blue-700 font-bold text-sm"
                            >
                              แก้ไข
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y divide-gray-100">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 sm:p-5 active:bg-gray-50 transition-colors">
                  {editingSession?.id === session.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">รอบ</label>
                          <input
                            type="text"
                            value={editingSession.session_name}
                            onChange={(e) => setEditingSession({ ...editingSession, session_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">เวลาออกผล</label>
                          <input
                            type="time"
                            value={editingSession.session_time}
                            onChange={(e) => setEditingSession({ ...editingSession, session_time: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">สถานะ</label>
                          <select
                            value={editingSession.is_market_open}
                            onChange={(e) => setEditingSession({ ...editingSession, is_market_open: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
                          >
                            <option value={1}>ตลาดเปิด</option>
                            <option value={0}>ตลาดปิด</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ลำดับ</label>
                          <input
                            type="number"
                            value={editingSession.display_order}
                            onChange={(e) => setEditingSession({ ...editingSession, display_order: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSave}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                          size="sm"
                        >
                          บันทึกแก้ไข
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1 font-bold"
                          size="sm"
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900 text-base">{session.session_name}</h3>
                          <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">{session.session_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${session.is_market_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {session.is_market_open ? 'ตลาดเปิด' : 'ตลาดปิด'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">ลำดับ: {session.display_order}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEdit(session)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 font-bold h-8"
                      >
                        แก้ไข
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">คำแนะนำการใช้งาน</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-2.5">
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>รอบ:</strong> ชื่อรอบการออกผล (เช่น เช้า, บ่าย)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>เวลา:</strong> เวลาที่ออกผล (รูปแบบ HH:MM)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>สถานะ:</strong> ตลาดเปิด = มีการซื้อขาย, ตลาดปิด = ไม่มีการซื้อขาย</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>ลำดับ:</strong> ลำดับการแสดงผลในหน้าเว็บ (เลขน้อยจะแสดงขึ้นก่อน)</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
