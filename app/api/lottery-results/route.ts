// API route for lottery results - GET all results and POST new result
// Handles fetching historical lottery results (15 latest) and creating new results
// Links to: @/lib/db.ts (database), @/lib/types.ts (types), @/app/components/DataTable.tsx (frontend consumer)
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { LotteryResultWithSession, CreateLotteryResultRequest } from '@/lib/types';
import { z } from 'zod';

// Validation schema for creating lottery result
const createLotteryResultSchema = z.object({
  result_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  session_id: z.number().int().positive(),
  top_number: z.string().regex(/^\d{3}-\d{2}$/, 'Top number must be in XXX-XX format'),
  bottom_number: z.string().regex(/^\d{3}-\d{2}$/, 'Bottom number must be in XXX-XX format'),
});

// GET /api/lottery-results - Fetch latest lottery results
// Query params: limit (default: 15)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '15');

    // Fetch latest results with session information
    const results = db.prepare(`
      SELECT 
        lr.*,
        ms.session_name,
        ms.session_time
      FROM lottery_results lr
      JOIN market_sessions ms ON lr.session_id = ms.id
      ORDER BY lr.result_date DESC, ms.display_order ASC
      LIMIT ?
    `).all(limit) as LotteryResultWithSession[];

    // Return with no-cache headers to prevent browser caching stale lottery data
    // Links to: @/app/components/DataTable.tsx (displays historical results, must always be fresh)
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
    console.error('Error fetching lottery results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lottery results' },
      { status: 500 }
    );
  }
}

// POST /api/lottery-results - Create new lottery result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createLotteryResultSchema.parse(body);

    // Check if result already exists for this date and session
    const existing = db.prepare(`
      SELECT id FROM lottery_results 
      WHERE result_date = ? AND session_id = ?
    `).get(validatedData.result_date, validatedData.session_id);

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Result already exists for this date and session' },
        { status: 409 }
      );
    }

    // Insert new result
    const result = db.prepare(`
      INSERT INTO lottery_results (result_date, session_id, top_number, bottom_number)
      VALUES (?, ?, ?, ?)
    `).run(
      validatedData.result_date,
      validatedData.session_id,
      validatedData.top_number,
      validatedData.bottom_number
    );

    return NextResponse.json({
      success: true,
      data: { id: result.lastInsertRowid },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating lottery result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lottery result' },
      { status: 500 }
    );
  }
}

