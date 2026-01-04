/**
 * [PURPOSE] Admin history management page for viewing, editing, and deleting past lottery results.
 * [FLOW] UI -> API (@/api/lottery-results) -> Database
 * [LINKS]
 * - Calls: @/app/api/lottery-results/route.ts
 * - Calls: @/app/api/lottery-results/[id]/route.ts
 * - Types: @/lib/types.ts
 */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MarketSession, LotteryResultWithSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, X, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
        if (currentPage > newTotalPages && newTotalPages > 0) {
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
        <div className="text-gray-600 font-medium">กำลังโหลด...</div>
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
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-800 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => router.push('/admin')}>
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
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {groupedResults.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="py-16 text-center text-gray-400">
                <div className="mb-2">ไม่มีข้อมูลผลย้อนหลัง</div>
                <Button onClick={() => router.push('/admin')} variant="link">ไปหน้าบันทึกผล</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-6">
                {currentResults.map((group) => (
                  <Card key={group.date} className="overflow-hidden border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="bg-gray-50/50 py-4 border-b border-gray-100">
                      <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                        <span className="text-gray-900 font-bold">วันที่ {formatDate(group.date)}</span>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">{group.results.length} รายการ</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Desktop View (Table) */}
                      <div className="hidden md:block">
                        <table className="w-full">
                          <thead className="bg-white">
                            <tr className="border-b border-gray-50">
                              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">รอบ</th>
                              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">เวลา</th>
                              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">ผลหวย (บน-ล่าง)</th>
                              <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {group.results.map((result) => (
                              <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 font-bold">{result.session_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{result.session_time}</td>
                                <td className="px-6 py-4 text-sm">
                                  {editingId === result.id ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="text"
                                        value={editValues.topThree}
                                        onChange={(e) => handleInputChange('topThree', e.target.value)}
                                        placeholder="3 ตัว"
                                        className="w-20 h-9 text-center font-mono font-bold"
                                        maxLength={3}
                                      />
                                      <span className="text-gray-400 font-bold">-</span>
                                      <Input
                                        type="text"
                                        value={editValues.bottomTwo}
                                        onChange={(e) => handleInputChange('bottomTwo', e.target.value)}
                                        placeholder="2 ตัว"
                                        className="w-16 h-9 text-center font-mono font-bold"
                                        maxLength={2}
                                      />
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                                      <span className="font-mono font-bold text-blue-700 text-lg tracking-wider">
                                        {result.top_number}
                                      </span>
                                      <span className="text-blue-200">|</span>
                                      <span className="font-mono font-bold text-blue-700 text-lg tracking-wider">
                                        {result.bottom_number}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {editingId === result.id ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => handleSaveEdit(result)}
                                        className="bg-green-600 hover:bg-green-700 h-8 font-bold px-3"
                                      >
                                        บันทึก
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCancelEdit}
                                        className="h-8 text-gray-500 hover:text-gray-700 font-bold"
                                      >
                                        ยกเลิก
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={() => handleEdit(result)}
                                        className="text-blue-600 hover:bg-blue-50"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(result)}
                                        className="text-red-500 hover:bg-red-50"
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

                      {/* Mobile View (Cards) */}
                      <div className="md:hidden divide-y divide-gray-50">
                        {group.results.map((result) => (
                          <div key={result.id} className="p-4 active:bg-gray-50 transition-colors">
                            {editingId === result.id ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">{result.session_name}</span>
                                    <span className="text-xs text-gray-500 font-mono">{result.session_time}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">บน (3 ตัว)</label>
                                    <Input
                                      type="text"
                                      value={editValues.topThree}
                                      onChange={(e) => handleInputChange('topThree', e.target.value)}
                                      className="h-10 text-center font-mono font-bold text-lg"
                                      maxLength={3}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">ล่าง (2 ตัว)</label>
                                    <Input
                                      type="text"
                                      value={editValues.bottomTwo}
                                      onChange={(e) => handleInputChange('bottomTwo', e.target.value)}
                                      className="h-10 text-center font-mono font-bold text-lg"
                                      maxLength={2}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(result)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                                  >
                                    บันทึก
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="flex-1 font-bold"
                                  >
                                    ยกเลิก
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">{result.session_name}</span>
                                    <span className="text-xs text-gray-500 font-mono">{result.session_time}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xl font-mono font-black text-blue-600 tracking-tighter italic">
                                      {result.top_number}
                                    </span>
                                    <span className="text-gray-300 font-light text-xl">-</span>
                                    <span className="text-xl font-mono font-black text-blue-600 tracking-tighter italic">
                                      {result.bottom_number}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(result)}
                                    className="text-blue-500"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(result)}
                                    className="text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                  <div className="text-xs text-gray-500 font-medium order-2 sm:order-1">
                    หน้าที่ <span className="text-gray-900 font-bold">{currentPage}</span> จาก <span className="text-gray-900 font-bold">{totalPages}</span>
                  </div>
                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => updatePage(1)}
                      disabled={currentPage === 1}
                      className="rounded-lg shadow-sm"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => updatePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1 px-1">
                      {[...Array(Math.min(3, totalPages))].map((_, i) => {
                        let pageNum = currentPage;
                        if (currentPage === 1) pageNum = i + 1;
                        else if (currentPage === totalPages) pageNum = totalPages - 2 + i;
                        else pageNum = currentPage - 1 + i;
                        
                        if (pageNum > 0 && pageNum <= totalPages) {
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "ghost"}
                              size="icon-sm"
                              onClick={() => updatePage(pageNum)}
                              className={`w-8 h-8 font-bold ${currentPage === pageNum ? 'shadow-md' : ''}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg shadow-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => updatePage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="rounded-lg shadow-sm"
                    >
                      <ChevronsRight className="h-4 w-4" />
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
