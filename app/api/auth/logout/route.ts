// API route for admin logout
// Clears admin session cookie
// Links to: Admin panel logout functionality
import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/logout - Admin logout
export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logout successful',
  });

  // Clear cookie
  response.cookies.delete('admin_token');

  return response;
}

