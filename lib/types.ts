// TypeScript types for lottery system
// Shared types used across API routes and frontend components
// Links to: @/lib/db.ts (database schema), API routes in @/app/api/*

export interface MarketSession {
  id: number;
  session_name: string;
  session_time: string;
  is_market_open: number; // SQLite uses INTEGER for boolean (0 or 1)
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LotteryResult {
  id: number;
  result_date: string; // Format: YYYY-MM-DD
  session_id: number;
  top_number: string; // Format: XXX-XX (e.g., "139-92")
  bottom_number: string; // Format: XXX-XX
  created_at: string;
  updated_at: string;
}

// Extended type with session information for display
export interface LotteryResultWithSession extends LotteryResult {
  session_name: string;
  session_time: string;
}

// Admin user type
export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

// API request/response types
export interface CreateLotteryResultRequest {
  result_date: string;
  session_id: number;
  top_number: string;
  bottom_number: string;
}

export interface UpdateLotteryResultRequest {
  top_number?: string;
  bottom_number?: string;
}

export interface UpdateMarketSessionRequest {
  session_name?: string;
  session_time?: string;
  is_market_open?: number;
  display_order?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

