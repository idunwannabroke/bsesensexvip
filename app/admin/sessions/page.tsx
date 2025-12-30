// Admin sessions management page - Market sessions configuration
// Allows editing of market session times and open/close status
// Links to: @/app/api/market-sessions/* (session APIs), @/lib/types.ts (types)
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
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => router.push('/admin')}>
              <img
                src="/images/logo-header.png"
                alt="BSESensexVip Logo"
                className="h-8 sm:h-10 w-auto"
              />
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Sessions List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">รอบ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">เวลา</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ลำดับ</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      {editingSession?.id === session.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editingSession.session_name}
                              onChange={(e) => setEditingSession({ ...editingSession, session_name: e.target.value })}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="time"
                              value={editingSession.session_time}
                              onChange={(e) => setEditingSession({ ...editingSession, session_time: e.target.value })}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editingSession.is_market_open}
                              onChange={(e) => setEditingSession({ ...editingSession, is_market_open: parseInt(e.target.value) })}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                              className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-700 font-medium mr-3"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 hover:text-gray-700 font-medium"
                            >
                              ยกเลิก
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-800 font-medium">{session.session_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{session.session_time}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${
                              session.is_market_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {session.is_market_open ? 'ตลาดเปิด' : 'ตลาดปิด'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{session.display_order}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEdit(session)}
                              className="text-blue-600 hover:text-blue-700 font-medium"
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
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">คำแนะนำ</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>รอบ:</strong> ชื่อรอบการออกผล (เช่น เช้า, บ่าย)</li>
              <li>• <strong>เวลา:</strong> เวลาที่ออกผล (รูปแบบ HH:MM)</li>
              <li>• <strong>สถานะ:</strong> ตลาดเปิด = มีการซื้อขาย, ตลาดปิด = ไม่มีการซื้อขาย</li>
              <li>• <strong>ลำดับ:</strong> ลำดับการแสดงผล (เลขน้อยแสดงก่อน)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

