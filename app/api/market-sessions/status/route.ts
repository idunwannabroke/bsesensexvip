// API route for current market status calculation
// Returns current market open/close status and next session information
// Links to: @/lib/db.ts (database), @/app/components/StockInfo.tsx (frontend consumer)
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { MarketSession } from '@/lib/types';

// GET /api/market-sessions/status - Get current market status
export async function GET(request: NextRequest) {
  try {
    // Fetch all sessions ordered by time
    const sessions = db.prepare(`
      SELECT * FROM market_sessions
      ORDER BY display_order ASC
    `).all() as MarketSession[];

    if (sessions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No market sessions configured',
      }, { status: 404 });
    }

    // Get current time in Asia/Bangkok timezone (UTC+7) to match session schedule
    const now = new Date();
    const bangkokTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
    );
    const currentMinutes =
      bangkokTime.getHours() * 60 + bangkokTime.getMinutes();

    // Convert session times to minutes
    const sessionTimes = sessions.map(session => {
      const [hours, minutes] = session.session_time.split(':').map(Number);
      return {
        ...session,
        timeInMinutes: hours * 60 + minutes,
      };
    });

    // Find current and next session based on time
    let currentSession = null;
    let nextSession = null;
    let isMarketOpen = false;

    // Find which session we're in or between
    let found = false;
    for (let i = 0; i < sessionTimes.length; i++) {
      const session = sessionTimes[i];

      if (currentMinutes < session.timeInMinutes) {
        // We haven't reached this session yet
        if (i === 0) {
          // Before first session - we're past yesterday's last session
          currentSession = sessionTimes[sessionTimes.length - 1];
          nextSession = session;
          isMarketOpen = false;
        } else {
          // Between sessions - previous session is current
          currentSession = sessionTimes[i - 1];
          nextSession = session;
          isMarketOpen = currentSession.is_market_open === 1;
        }
        found = true;
        break;
      }
    }

    // If not found, we're past all sessions (after last session of the day)
    if (!found) {
      currentSession = sessionTimes[sessionTimes.length - 1];
      nextSession = sessionTimes[0]; // Tomorrow's first session
      isMarketOpen = currentSession.is_market_open === 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        isMarketOpen,
        currentSession: {
          name: currentSession?.session_name || '',
          time: currentSession?.session_time || '',
        },
        nextSession: {
          name: nextSession?.session_name || '',
          time: nextSession?.session_time || '',
        },
        statusText: isMarketOpen ? 'Market Open' : 'Market Closed',
      },
    });
  } catch (error) {
    console.error('Error getting market status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get market status' },
      { status: 500 }
    );
  }
}

