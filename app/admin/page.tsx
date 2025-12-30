// Admin panel main page - Lottery results management
// Provides user-friendly interface for managing lottery results and market sessions
// Links to: API routes in @/app/api/*, @/lib/types.ts (types)
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketSession, LotteryResultWithSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Key } from 'lucide-react';
import { MarketIndexEditor } from '@/app/components/admin/MarketIndexEditor';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<Record<number, { topThree: string; bottomTwo: string }>>({});

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
        // Initialize results state
        const initialResults: Record<number, { topThree: string; bottomTwo: string }> = {};
        data.data.forEach((session: MarketSession) => {
          initialResults[session.id] = { topThree: '', bottomTwo: '' };
        });
        setResults(initialResults);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Load results for selected date
  useEffect(() => {
    if (selectedDate && sessions.length > 0) {
      loadResultsForDate(selectedDate);
    }
  }, [selectedDate, sessions]);

  const loadResultsForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/lottery-results/by-date?date=${date}`);
      const data = await response.json();
      if (data.success) {
        const loadedResults: Record<number, { topThree: string; bottomTwo: string }> = {};
        sessions.forEach((session) => {
          const result = data.data.find((r: LotteryResultWithSession) => r.session_id === session.id);
          if (result) {
            // Split XXX-XX into topThree (XXX) and bottomTwo (XX)
            const [topThree, bottomTwo] = result.top_number.split('-');
            loadedResults[session.id] = { topThree: topThree || '', bottomTwo: bottomTwo || '' };
          } else {
            loadedResults[session.id] = { topThree: '', bottomTwo: '' };
          }
        });
        setResults(loadedResults);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  // Handle input change
  const handleInputChange = (sessionId: number, field: 'topThree' | 'bottomTwo', value: string) => {
    // Remove non-numeric characters
    let formatted = value.replace(/[^0-9]/g, '');
    // Limit length: topThree = 3 digits, bottomTwo = 2 digits
    const maxLength = field === 'topThree' ? 3 : 2;
    formatted = formatted.slice(0, maxLength);
    setResults(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        [field]: formatted,
      },
    }));
  };

  // Save results
  const handleSave = async () => {
    // Validation: Check if at least one result is filled
    const hasAnyData = sessions.some(session => {
      const result = results[session.id];
      return result?.topThree || result?.bottomTwo;
    });

    if (!hasAnyData) {
      toast.error('กรุณากรอกข้อมูลอย่างน้อย 1 รอบ');
      return;
    }

    // Validation: Check for incomplete data
    const hasIncompleteData = sessions.some(session => {
      const result = results[session.id];
      return (result?.topThree && !result?.bottomTwo) || (!result?.topThree && result?.bottomTwo);
    });

    if (hasIncompleteData) {
      toast.error('กรุณากรอกข้อมูลให้ครบทั้ง บน และ ล่าง');
      return;
    }

    try {
      setIsSaving(true);
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const session of sessions) {
        const result = results[session.id];
        if (!result?.topThree || !result?.bottomTwo) continue;

        // Validate format: topThree = 3 digits, bottomTwo = 2 digits
        if (!/^\d{3}$/.test(result.topThree) || !/^\d{2}$/.test(result.bottomTwo)) {
          errorCount++;
          errors.push(`${session.session_name}: รูปแบบไม่ถูกต้อง (ต้องเป็น 3 ตัว และ 2 ตัว)`);
          continue;
        }

        // Combine into XXX-XX format
        const combinedNumber = `${result.topThree}-${result.bottomTwo}`;

        // Check if result exists
        const checkResponse = await fetch(`/api/lottery-results/by-date?date=${selectedDate}`);
        const checkData = await checkResponse.json();
        const existing = checkData.data?.find((r: LotteryResultWithSession) => r.session_id === session.id);

        if (existing) {
          // Update existing
          const response = await fetch(`/api/lottery-results/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              top_number: combinedNumber,
              bottom_number: combinedNumber,
            }),
          });
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            const data = await response.json();
            errors.push(`${session.session_name}: ${data.error || 'บันทึกไม่สำเร็จ'}`);
          }
        } else {
          // Create new
          const response = await fetch('/api/lottery-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              result_date: selectedDate,
              session_id: session.id,
              top_number: combinedNumber,
              bottom_number: combinedNumber,
            }),
          });
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            const data = await response.json();
            errors.push(`${session.session_name}: ${data.error || 'บันทึกไม่สำเร็จ'}`);
          }
        }
      }

      if (errorCount === 0 && successCount > 0) {
        toast.success(`บันทึกสำเร็จทั้งหมด ${successCount} รอบ`);
      } else if (errorCount > 0 && successCount > 0) {
        toast.warning(`บันทึกสำเร็จ ${successCount} รอบและล้มเหลว ${errorCount} รอบ`, {
          description: errors.join(', '),
        });
      } else if (errorCount > 0) {
        toast.error(`บันทึกล้มเหลว ${errorCount} รอบ`, {
          description: errors.join(', '),
        });
      }
    } catch (error) {
      console.error('Failed to save results:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
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
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 cursor-pointer" onClick={() => router.push('/')}>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold leading-none">BSESensexVip</h1>
                <span className="text-[10px] sm:text-xs text-blue-400 font-medium tracking-wider">ระบบจัดการแอดมิน</span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                onClick={() => router.push('/admin/change-password')}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Key className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">เปลี่ยนรหัสผ่าน</span>
                <span className="sm:hidden">เปลี่ยนรหัส</span>
              </Button>
              <div className="w-px h-6 bg-gray-700 mx-1"></div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
                <span className="sm:hidden">ออก</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Market Index Editor */}
          <div className="mb-6">
            <MarketIndexEditor />
          </div>

          {/* Date Selector */}
          <Card className="mb-6 border-[#005a9e]/20">
            <CardHeader className="bg-gray-50/50">
              <CardTitle className="text-[#005a9e]">เลือกวันที่</CardTitle>
              <CardDescription>เลือกวันที่ต้องการบันทึกผล</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs border-[#005a9e]/30 focus:ring-[#005a9e]"
              />
            </CardContent>
          </Card>

          {/* Results Form */}
          <Card className="mb-6 border-[#005a9e]/20">
            <CardHeader className="bg-gray-50/50">
              <CardTitle className="text-[#005a9e]">บันทึกผลหวย</CardTitle>
              <CardDescription>กรอกเลขแต่ละรอบ - บน: 3 ตัว, ล่าง: 2 ตัว (เช่น 002-09)</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">

              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {session.session_name === 'เช้า' ? 'Morning' :
                            session.session_name === 'บ่าย' ? 'Afternoon' : session.session_name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">เวลา: {session.session_time}</p>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${session.is_market_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {session.is_market_open ? 'เปิด' : 'ปิด'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor={`top-${session.id}`} className="text-xs font-bold text-gray-700">บน (XXX)</Label>
                        <Input
                          id={`top-${session.id}`}
                          type="text"
                          value={results[session.id]?.topThree || ''}
                          onChange={(e) => handleInputChange(session.id, 'topThree', e.target.value)}
                          placeholder="002"
                          className="font-mono text-lg border-gray-200"
                          maxLength={3}
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`bottom-${session.id}`} className="text-xs font-bold text-gray-700">ล่าง (XX)</Label>
                        <Input
                          id={`bottom-${session.id}`}
                          type="text"
                          value={results[session.id]?.bottomTwo || ''}
                          onChange={(e) => handleInputChange(session.id, 'bottomTwo', e.target.value)}
                          placeholder="09"
                          className="font-mono text-lg border-gray-200"
                          maxLength={2}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-6 w-full bg-[#005a9e] hover:bg-[#004d87] text-white font-bold h-12"
                size="lg"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
              </Button>
            </CardContent>
          </Card>

          {/* Management Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-[#005a9e]/10">
              <CardHeader>
                <CardTitle className="text-base">จัดการประวัติ</CardTitle>
                <CardDescription>ดู แก้ไข และลบผลย้อนหลัง</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/admin/history')}
                  variant="outline"
                  className="w-full border-[#005a9e]/30 text-[#005a9e] hover:bg-[#005a9e]/5 font-bold"
                >
                  จัดการผลย้อนหลัง
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[#005a9e]/10">
              <CardHeader>
                <CardTitle className="text-base">จัดการรอบเวลา</CardTitle>
                <CardDescription>แก้ไขรอบเวลาและสถานะตลาด</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/admin/sessions')}
                  variant="outline"
                  className="w-full border-[#005a9e]/30 text-[#005a9e] hover:bg-[#005a9e]/5 font-bold"
                >
                  จัดการรอบเวลา
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
