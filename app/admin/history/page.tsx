// Admin history management page - Historical lottery results management
// Allows viewing, editing, and deleting past lottery results
// Links to: @/app/api/lottery-results/* (result APIs), @/lib/types.ts (types)
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MarketSession, LotteryResultWithSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface GroupedResult {
  date: string;
  results: LotteryResultWithSession[];
}

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ topThree: string; bottomTwo: string }>({ topThree: '', bottomTwo: '' });
  
  // Pagination state - read from URL
  const itemsPerPage = 10; // 10 dates per page
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  // Sync currentPage with URL on mount/change
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
  }, [searchParams]);

  // Verify authentication
  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        setIsAuthenticated(true);
        loadData();
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

  const loadData = async () => {
    try {
      // Load sessions
      const sessionsResponse = await fetch('/api/market-sessions');
      const sessionsData = await sessionsResponse.json();
      if (sessionsData.success) {
        setSessions(sessionsData.data);
      }

      // Load all results
      const resultsResponse = await fetch('/api/lottery-results?limit=1000');
      const resultsData = await resultsResponse.json();
      if (resultsData.success) {
        // Group by date
        const grouped: Record<string, LotteryResultWithSession[]> = {};
        resultsData.data.forEach((result: LotteryResultWithSession) => {
          if (!grouped[result.result_date]) {
            grouped[result.result_date] = [];
          }
          grouped[result.result_date].push(result);
        });

        // Convert to array and sort by date (newest first)
        const groupedArray = Object.entries(grouped)
          .map(([date, results]) => ({ date, results }))
          .sort((a, b) => b.date.localeCompare(a.date));

        setGroupedResults(groupedArray);
        // Reset to first page if current page is out of bounds
        const newTotalPages = Math.ceil(groupedArray.length / itemsPerPage);
        if (currentPage > newTotalPages) {
          updatePage(1);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('โหลดข้อมูลไม่สำเร็จ');
    }
  };

  const handleEdit = (result: LotteryResultWithSession) => {
    setEditingId(result.id);
    setEditValues({ topThree: result.top_number, bottomTwo: result.bottom_number });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ topThree: '', bottomTwo: '' });
  };

  const handleSaveEdit = async (result: LotteryResultWithSession) => {
    // Validate
    if (!/^\d{3}$/.test(editValues.topThree) || !/^\d{2}$/.test(editValues.bottomTwo)) {
      toast.error('รูปแบบไม่ถูกต้อง (ต้องเป็น 3 ตัว-2 ตัว)');
      return;
    }

    try {
      const response = await fetch(`/api/lottery-results/${result.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          top_number: editValues.topThree,
          bottom_number: editValues.bottomTwo,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('บันทึกสำเร็จ');
        setEditingId(null);
        loadData();
      } else {
        toast.error(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (result: LotteryResultWithSession) => {
    if (!confirm(`ยืนยันลบผล ${result.session_name} วันที่ ${formatDate(result.result_date)}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/lottery-results/${result.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('ลบสำเร็จ');
        loadData();
      } else {
        toast.error(data.error || 'ลบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleInputChange = (field: 'topThree' | 'bottomTwo', value: string) => {
    let formatted = value.replace(/[^0-9]/g, '');
    const maxLength = field === 'topThree' ? 3 : 2;
    formatted = formatted.slice(0, maxLength);
    setEditValues(prev => ({ ...prev, [field]: formatted }));
  };

  const updatePage = (page: number) => {
    setCurrentPage(page);
    router.push(`/admin/history?page=${page}`);
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

  // Calculate pagination
  const totalPages = Math.ceil(groupedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = groupedResults.slice(startIndex, endIndex);

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
                <h1 className="text-lg sm:text-xl font-bold leading-none">จัดการผลย้อนหลัง</h1>
                <span className="text-[10px] sm:text-xs text-blue-400 font-medium tracking-wider uppercase">Lottery History</span>
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
        <div className="max-w-6xl mx-auto">
          {groupedResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                ไม่มีข้อมูลผลย้อนหลัง
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-6">
                {currentResults.map((group) => (
                  <Card key={group.date}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      วันที่ {formatDate(group.date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">รอบ</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">เวลา</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ผลหวย</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {group.results.map((result) => (
                            <tr key={result.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{result.session_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{result.session_time}</td>
                              <td className="px-4 py-3 text-sm">
                                {editingId === result.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      value={editValues.topThree}
                                      onChange={(e) => handleInputChange('topThree', e.target.value)}
                                      placeholder="3 ตัว"
                                      className="w-20 h-8 text-center"
                                      maxLength={3}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <Input
                                      type="text"
                                      value={editValues.bottomTwo}
                                      onChange={(e) => handleInputChange('bottomTwo', e.target.value)}
                                      placeholder="2 ตัว"
                                      className="w-16 h-8 text-center"
                                      maxLength={2}
                                    />
                                  </div>
                                ) : (
                                  <span className="font-mono font-semibold text-gray-900">
                                    {result.top_number}-{result.bottom_number}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {editingId === result.id ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleSaveEdit(result)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(result)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDelete(result)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    หน้า {currentPage} จาก {totalPages} (แสดง {startIndex + 1}-{Math.min(endIndex, groupedResults.length)} จาก {groupedResults.length} วัน)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePage(1)}
                      disabled={currentPage === 1}
                    >
                      หน้าแรก
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      ก่อนหน้า
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      ถัดไป
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      หน้าสุดท้าย
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HistoryManagementPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
