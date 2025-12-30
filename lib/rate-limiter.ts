// Simple in-memory rate limiter for login attempts
// Prevents brute force attacks without external dependencies
export class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = this.attempts.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    if (!record || now > record.resetAt) {
      // First attempt or window expired
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return { 
        allowed: true, 
        remaining: this.maxAttempts - 1,
        resetIn: this.windowMs
      };
    }

    if (record.count >= this.maxAttempts) {
      // Too many attempts
      return { 
        allowed: false, 
        remaining: 0,
        resetIn: record.resetAt - now
      };
    }

    // Increment and allow
    record.count++;
    return { 
      allowed: true, 
      remaining: this.maxAttempts - record.count,
      resetIn: record.resetAt - now
    };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetAt) {
        this.attempts.delete(key);
      }
    }
  }
}

// Global rate limiter instance for login attempts
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
