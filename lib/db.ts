// Database initialization and connection management
// Handles SQLite database setup for lottery results and market sessions
// Links to: API routes in @/app/api/* for data access
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Get database path
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'lottery.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Market sessions/rounds configuration table
  // Stores the time slots for lottery draws (e.g., 10:25, 12:55, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_name TEXT NOT NULL,
      session_time TEXT NOT NULL,
      is_market_open INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_name, session_time)
    )
  `);

  // Ensure unique index for existing databases
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_market_sessions_name_time ON market_sessions(session_name, session_time)`);

  // Lottery results table
  // Stores daily lottery results for each session (บน/ล่าง)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lottery_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      result_date DATE NOT NULL,
      session_id INTEGER NOT NULL,
      top_number TEXT NOT NULL,
      bottom_number TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES market_sessions(id),
      UNIQUE(result_date, session_id)
    )
  `);

  // Admin users table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Market index table for SET/stock market display
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      index_name TEXT NOT NULL DEFAULT 'SET',
      current_value TEXT NOT NULL,
      change_value TEXT NOT NULL,
      change_percent TEXT NOT NULL,
      is_positive INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if default sessions exist
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM market_sessions').get() as { count: number };
  
  if (sessionCount.count === 0) {
    // Insert default market sessions
    const insertSession = db.prepare(`
      INSERT OR IGNORE INTO market_sessions (session_name, session_time, is_market_open, display_order)
      VALUES (?, ?, ?, ?)
    `);

    const sessions = [
      { name: 'เช้า', time: '12:55', isOpen: 0, order: 1 },
      { name: 'บ่าย', time: '16:55', isOpen: 0, order: 2 },
    ];

    const insertMany = db.transaction((sessions) => {
      for (const session of sessions) {
        insertSession.run(session.name, session.time, session.isOpen, session.order);
      }
    });

    insertMany(sessions);
  }

  // Check if market_index has default data
  const indexCount = db.prepare('SELECT COUNT(*) as count FROM market_index').get() as { count: number };
  
  if (indexCount.count === 0) {
    // Insert default market index
    db.prepare(`
      INSERT INTO market_index (index_name, current_value, change_value, change_percent, is_positive)
      VALUES (?, ?, ?, ?, ?)
    `).run('SET', '2,080.50', '-13.03', '0.62', 0);
  }
}

// Initialize on import
initializeDatabase();

export default db;

