// API route for market sessions - GET all sessions and POST new session
// Manages lottery draw time slots and market open/close status
// Links to: @/lib/db.ts (database), @/lib/types.ts (types), @/app/components/StockInfo.tsx (frontend consumer)
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { MarketSession } from '@/lib/types';
import { z } from 'zod';

// Validation schema for creating market session
const createMarketSessionSchema = z.object({
  session_name: z.string().min(1, 'Session name is required'),
  session_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  is_market_open: z.number().int().min(0).max(1),
  display_order: z.number().int().positive(),
});

// GET /api/market-sessions - Fetch all market sessions
export async function GET(request: NextRequest) {
  try {
    const sessions = db.prepare(`
      SELECT * FROM market_sessions
      ORDER BY display_order ASC
    `).all() as MarketSession[];

    // Return with no-cache headers to prevent browser caching stale session data
    // Links to: @/app/components/StockInfo.tsx, @/app/components/DataTable.tsx (consume session list)
    return NextResponse.json(
      {
        success: true,
        data: sessions,
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
    console.error('Error fetching market sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market sessions' },
      { status: 500 }
    );
  }
}

// POST /api/market-sessions - Create new market session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createMarketSessionSchema.parse(body);

    // Insert new session
    const result = db.prepare(`
      INSERT INTO market_sessions (session_name, session_time, is_market_open, display_order)
      VALUES (?, ?, ?, ?)
    `).run(
      validatedData.session_name,
      validatedData.session_time,
      validatedData.is_market_open,
      validatedData.display_order
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

    console.error('Error creating market session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create market session' },
      { status: 500 }
    );
  }
}

