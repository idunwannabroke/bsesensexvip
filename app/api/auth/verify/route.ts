// API route for verifying admin session with JWT
// Checks if current JWT token is valid and not expired
// Links to: @/lib/auth.ts (JWT verification), Admin panel for session validation
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, needsPasswordChange } from '@/lib/auth';

// GET /api/auth/verify - Verify admin session
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const verified = await verifySessionToken(token);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if password change is required
    const requiresPasswordChange = await needsPasswordChange(verified.userId);

    return NextResponse.json({
      success: true,
      data: {
        userId: verified.userId,
        username: verified.username,
        requiresPasswordChange,
      },
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

