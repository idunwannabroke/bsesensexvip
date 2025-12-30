// API route for market index - GET and PUT operations
// Handles fetching and updating market index display (SET value, change, percent)
// Links to: @/lib/db.ts (database), Frontend StockInfo component
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

// Validation schema for updating market index
const updateMarketIndexSchema = z.object({
  current_value: z.string().min(1, 'Current value is required'),
  change_value: z.string().min(1, 'Change value is required'),
  change_percent: z.string().regex(/^\d+\.?\d*$/, 'Change percent must be a number (e.g., 0.62)'),
  is_positive: z.number().int().min(0).max(1),
});

// GET /api/market-index - Fetch current market index
export async function GET() {
  try {
    const index = db.prepare('SELECT * FROM market_index ORDER BY id DESC LIMIT 1').get();

    if (!index) {
      return NextResponse.json(
        { success: false, error: 'Market index not found' },
        { status: 404 }
      );
    }

    // Return with no-cache headers to prevent browser caching stale market index
    // Links to: @/app/components/StockInfo.tsx (displays SET index, must always be fresh)
    return NextResponse.json(
      {
        success: true,
        data: index,
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
    console.error('Error fetching market index:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market index' },
      { status: 500 }
    );
  }
}

// PUT /api/market-index - Update market index
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateMarketIndexSchema.parse(body);

    // Update or insert
    const existing = db.prepare('SELECT id FROM market_index ORDER BY id DESC LIMIT 1').get() as any;

    if (existing) {
      db.prepare(`
        UPDATE market_index 
        SET current_value = ?, change_value = ?, change_percent = ?, is_positive = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        validatedData.current_value,
        validatedData.change_value,
        validatedData.change_percent,
        validatedData.is_positive,
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO market_index (current_value, change_value, change_percent, is_positive)
        VALUES (?, ?, ?, ?)
      `).run(
        validatedData.current_value,
        validatedData.change_value,
        validatedData.change_percent,
        validatedData.is_positive
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Market index updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating market index:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update market index' },
      { status: 500 }
    );
  }
}
