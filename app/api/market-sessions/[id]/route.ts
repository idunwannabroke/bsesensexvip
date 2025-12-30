// API route for single market session - GET, PUT, DELETE operations
// Handles individual market session operations by ID
// Links to: @/lib/db.ts (database), @/lib/types.ts (types), Admin panel for session management
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { UpdateMarketSessionRequest } from '@/lib/types';
import { z } from 'zod';

// Validation schema for updating market session
const updateMarketSessionSchema = z.object({
  session_name: z.string().min(1).optional(),
  session_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  is_market_open: z.number().int().min(0).max(1).optional(),
  display_order: z.number().int().positive().optional(),
});

// GET /api/market-sessions/[id] - Fetch single market session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = db.prepare('SELECT * FROM market_sessions WHERE id = ?').get(id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error fetching market session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market session' },
      { status: 500 }
    );
  }
}

// PUT /api/market-sessions/[id] - Update market session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateMarketSessionSchema.parse(body);

    // Check if session exists
    const existing = db.prepare('SELECT id FROM market_sessions WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.session_name !== undefined) {
      updates.push('session_name = ?');
      values.push(validatedData.session_name);
    }

    if (validatedData.session_time !== undefined) {
      updates.push('session_time = ?');
      values.push(validatedData.session_time);
    }

    if (validatedData.is_market_open !== undefined) {
      updates.push('is_market_open = ?');
      values.push(validatedData.is_market_open);
    }

    if (validatedData.display_order !== undefined) {
      updates.push('display_order = ?');
      values.push(validatedData.display_order);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    // Execute update
    db.prepare(`
      UPDATE market_sessions 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating market session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update market session' },
      { status: 500 }
    );
  }
}

// DELETE /api/market-sessions/[id] - Delete market session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if session exists
    const existing = db.prepare('SELECT id FROM market_sessions WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if there are any lottery results using this session
    const resultsCount = db.prepare(
      'SELECT COUNT(*) as count FROM lottery_results WHERE session_id = ?'
    ).get(id) as { count: number };

    if (resultsCount.count > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete session with existing results' },
        { status: 409 }
      );
    }

    // Delete session
    db.prepare('DELETE FROM market_sessions WHERE id = ?').run(id);

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting market session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete market session' },
      { status: 500 }
    );
  }
}

