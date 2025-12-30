// API route for admin login authentication with rate limiting
// Handles admin user login, JWT token generation, and password change enforcement
// Links to: @/lib/auth.ts (authentication), @/lib/rate-limiter.ts (rate limiting)
import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsername, verifyPassword, generateSessionToken, initializeDefaultAdmin, needsPasswordChange } from '@/lib/auth';
import { loginRateLimiter } from '@/lib/rate-limiter';
import { z } from 'zod';

// Initialize default admin on first import
initializeDefaultAdmin();

// Validation schema for login
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/login - Admin login with rate limiting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = loginSchema.parse(body);

    // Rate limiting - use username as key
    const rateLimitKey = `login:${validatedData.username}`;
    const rateLimit = loginRateLimiter.check(rateLimitKey);

    if (!rateLimit.allowed) {
      const minutesLeft = Math.ceil(rateLimit.resetIn / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many login attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` 
        },
        { status: 429 }
      );
    }

    // Get admin user
    const admin = getAdminByUsername(validatedData.username);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(validatedData.password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    loginRateLimiter.reset(rateLimitKey);

    // Check if password change is required
    const requiresPasswordChange = await needsPasswordChange(admin.id);

    // Generate JWT token
    const token = await generateSessionToken(admin.id, admin.username);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        username: admin.username,
        requiresPasswordChange,
      },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

