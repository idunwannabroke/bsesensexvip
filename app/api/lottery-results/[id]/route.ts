// API route for single lottery result - GET, PUT, DELETE operations
// Handles individual lottery result operations by ID
// Links to: @/lib/db.ts (database), @/lib/types.ts (types), Admin panel for editing results
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { UpdateLotteryResultRequest } from '@/lib/types';
import { z } from 'zod';

// Validation schema for updating lottery result
const updateLotteryResultSchema = z.object({
  top_number: z.string().regex(/^\d{3}$/, 'Top number must be 3 digits (XXX)').optional(),
  bottom_number: z.string().regex(/^\d{2}$/, 'Bottom number must be 2 digits (XX)').optional(),
});

// GET /api/lottery-results/[id] - Fetch single lottery result
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = db.prepare(`
      SELECT 
        lr.*,
        ms.session_name,
        ms.session_time
      FROM lottery_results lr
      JOIN market_sessions ms ON lr.session_id = ms.id
      WHERE lr.id = ?
    `).get(id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching lottery result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lottery result' },
      { status: 500 }
    );
  }
}

// PUT /api/lottery-results/[id] - Update lottery result
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateLotteryResultSchema.parse(body);

    // Check if result exists
    const existing = db.prepare('SELECT id FROM lottery_results WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Result not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.top_number !== undefined) {
      updates.push('top_number = ?');
      values.push(validatedData.top_number);
    }

    if (validatedData.bottom_number !== undefined) {
      updates.push('bottom_number = ?');
      values.push(validatedData.bottom_number);
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
      UPDATE lottery_results 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    return NextResponse.json({
      success: true,
      message: 'Result updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating lottery result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lottery result' },
      { status: 500 }
    );
  }
}

// DELETE /api/lottery-results/[id] - Delete lottery result
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if result exists
    const existing = db.prepare('SELECT id FROM lottery_results WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Result not found' },
        { status: 404 }
      );
    }

    // Delete result
    db.prepare('DELETE FROM lottery_results WHERE id = ?').run(id);

    return NextResponse.json({
      success: true,
      message: 'Result deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lottery result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lottery result' },
      { status: 500 }
    );
  }
}

