// API route for fetching lottery results by specific date
// Returns all session results for a given date (used for admin editing)
// Links to: @/lib/db.ts (database), Admin panel for date-specific result management
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { LotteryResultWithSession } from '@/lib/types';

// GET /api/lottery-results/by-date?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch results for the specific date
    const results = db.prepare(`
      SELECT 
        lr.*,
        ms.session_name,
        ms.session_time
      FROM lottery_results lr
      JOIN market_sessions ms ON lr.session_id = ms.id
      WHERE lr.result_date = ?
      ORDER BY ms.display_order ASC
    `).all(date) as LotteryResultWithSession[];

    // Return with no-cache headers to prevent browser caching stale lottery data
    // Links to: @/app/components/StockInfo.tsx (consumes today's results, must always be fresh)
    return NextResponse.json(
      {
        success: true,
        data: results,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching lottery results by date:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lottery results' },
      { status: 500 }
    );
  }
}

