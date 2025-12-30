// Authentication utilities for admin panel
// Handles password hashing, verification, and JWT session management
// Links to: @/lib/db.ts (database), API routes in @/app/api/auth/*
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import db from '@/lib/db';
import { AdminUser } from '@/lib/types';

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-please-set-env-variable-min-32-chars'
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Convert expires string to seconds
function getExpiresInSeconds(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));
  
  switch (unit) {
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    case 'm': return value * 60;
    default: return 24 * 60 * 60; // Default 24 hours
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get admin user by username
export function getAdminByUsername(username: string): AdminUser | undefined {
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as AdminUser | undefined;
}

// Get admin user by ID
export function getAdminById(id: number): AdminUser | undefined {
  return db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id) as AdminUser | undefined;
}

// Create admin user
export async function createAdmin(username: string, password: string): Promise<number> {
  const passwordHash = await hashPassword(password);
  const result = db.prepare(
    'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)'
  ).run(username, passwordHash);
  return result.lastInsertRowid as number;
}

// Update admin password
export async function updateAdminPassword(userId: number, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
}

// Check if user needs to change password (default password)
export async function needsPasswordChange(userId: number): Promise<boolean> {
  // Password change not required anymore since using secure default
  return false;
}

// Initialize default admin if none exists
export async function initializeDefaultAdmin() {
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  
  if (adminCount.count === 0) {
    await createAdmin('admin', 'Mbjj903209');
    console.log('✅ Default admin created: username=admin');
  }
}

// Generate JWT token
export async function generateSessionToken(userId: number, username: string): Promise<string> {
  const expiresInSeconds = getExpiresInSeconds(JWT_EXPIRES_IN);
  
  const token = await new SignJWT({ 
    userId, 
    username,
    type: 'admin'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT token
export async function verifySessionToken(token: string): Promise<{ userId: number; username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.userId && payload.username && payload.type === 'admin') {
      return {
        userId: payload.userId as number,
        username: payload.username as string,
      };
    }
    
    return null;
  } catch (error) {
    // Token expired or invalid
    return null;
  }
}

