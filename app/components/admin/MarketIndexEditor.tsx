// Market Index Editor Component
// Inline editor for BSE Sensex 30 index value, change, and percent displayed at top of admin panel
// Links to: @/app/api/market-index (API)
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, Save, Clock } from 'lucide-react';

interface MarketIndexData {
  id: number;
  index_name: string;
  current_value: string;
  change_value: string;
  change_percent: string;
  is_positive: number;
  updated_at: string;
}

export function MarketIndexEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<MarketIndexData | null>(null);
  const [formValues, setFormValues] = useState({
    current_value: '84,929.36',
    change_value: '+447.55',
    change_percent: '0.53',
    is_positive: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/market-index');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setFormValues({
          current_value: result.data.current_value,
          change_value: result.data.change_value,
          change_percent: result.data.change_percent,
          is_positive: result.data.is_positive,
        });
      }
    } catch (error) {
      console.error('Failed to load market index:', error);
      toast.error('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formValues.current_value || !formValues.change_value || !formValues.change_percent) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/market-index', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('บันทึกสำเร็จ');
        loadData();
      } else {
        toast.error(result.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-600">
          กำลังโหลด...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formValues.is_positive ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
          จัดการดัชนี BSE Sensex 30
        </CardTitle>
        <CardDescription>
          แก้ไขค่าดัชนี, การเปลี่ยนแปลง และเปอร์เซ็นต์ที่แสดงหน้าเว็บ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Current Value */}
          <div>
            <Label htmlFor="current_value">ค่าดัชนีปัจจุบัน</Label>
            <Input
              id="current_value"
              type="text"
              value={formValues.current_value}
              onChange={(e) => setFormValues(prev => ({ ...prev, current_value: e.target.value }))}
              placeholder="1,760.94"
            />
          </div>

          {/* Change Value */}
          <div>
            <Label htmlFor="change_value">การเปลี่ยนแปลง</Label>
            <Input
              id="change_value"
              type="text"
              value={formValues.change_value}
              onChange={(e) => setFormValues(prev => ({ ...prev, change_value: e.target.value }))}
              placeholder="-2.11 หรือ +5.25"
            />
          </div>

          {/* Change Percent */}
          <div>
            <Label htmlFor="change_percent">เปอร์เซ็นต์ (%)</Label>
            <Input
              id="change_percent"
              type="text"
              value={formValues.change_percent}
              onChange={(e) => setFormValues(prev => ({ ...prev, change_percent: e.target.value }))}
              placeholder="1.40"
            />
          </div>

          {/* Direction */}
          <div>
            <Label>ทิศทาง</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={formValues.is_positive === 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormValues(prev => ({ ...prev, is_positive: 1 }))}
                className={formValues.is_positive === 1 ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                ขึ้น (+)
              </Button>
              <Button
                type="button"
                variant={formValues.is_positive === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormValues(prev => ({ ...prev, is_positive: 0 }))}
                className={formValues.is_positive === 0 ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                ลง (-)
              </Button>
            </div>
          </div>
        </div>

        {/* Preview - match new StockInfo.tsx design */}
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">ตัวอย่างการแสดงผล (Frontend):</p>
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6 flex flex-col items-start justify-center bg-white shadow-sm max-w-lg mx-auto">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-gradient-to-b from-orange-500 via-white to-green-600 rounded-sm shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                </div>
                <span className="text-4xl sm:text-5xl font-black tabular-nums text-gray-900 tracking-tighter">
                  {formValues.current_value || '1,760.94'}
                </span>
              </div>
              <span className={`text-xl sm:text-2xl font-bold tabular-nums flex items-center gap-1.5 ${formValues.is_positive ? 'text-green-600' : 'text-red-600'}`}>
                {formValues.is_positive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {formValues.change_value || '2.11'} ({formValues.is_positive ? '+' : ''}{formValues.change_percent || '1.40'}%)
              </span>
            </div>

            <div className="w-full border-t border-dashed border-gray-300 my-2"></div>

            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-[11px] sm:text-[13px] tabular-nums">
                16:55:00 ตลาดปิด
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="w-full bg-[#005a9e] hover:bg-[#004d87]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลดัชนี'}
        </Button>
      </CardContent>
    </Card>
  );
}
