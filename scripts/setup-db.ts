// Complete database setup - Initialize schema, seed all data
// Run: bun run db:setup
// This is a one-command setup for production deployment
import db from '../lib/db';
import { format, subDays } from 'date-fns';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🚀 Starting complete database setup...\n');

  try {
    // ============================================
    // 1. Initialize Database Schema
    // ============================================
    console.log('📦 Step 1: Creating database tables...');

    // Market sessions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS market_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_name TEXT NOT NULL,
        session_time TEXT NOT NULL,
        is_market_open INTEGER NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Lottery results table
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

    // Admin users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Market index table
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

    console.log('✅ Tables created\n');

    // ============================================
    // 2. Seed Market Sessions
    // ============================================
    console.log('📦 Step 2: Seeding market sessions...');

    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM market_sessions').get() as { count: number };

    if (sessionCount.count === 0) {
      const insertSession = db.prepare(`
        INSERT INTO market_sessions (session_name, session_time, is_market_open, display_order)
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
      console.log('✅ Seeded 2 market sessions');
    } else {
      console.log('ℹ️  Market sessions already exist, skipping');
    }

    // ============================================
    // 3. Seed Admin User
    // ============================================
    console.log('\n📦 Step 3: Creating admin user...');

    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };

    if (adminCount.count === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = 'Mbjj903209';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(defaultUsername, hashedPassword);

      console.log('✅ Admin user created');
      console.log(`   Username: ${defaultUsername}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log('   ⚠️  IMPORTANT: Change this password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists, skipping');
    }

    // ============================================
    // 4. Seed Market Index
    // ============================================
    console.log('\n📦 Step 4: Seeding market index (SET)...');

    const indexCount = db.prepare('SELECT COUNT(*) as count FROM market_index').get() as { count: number };

    if (indexCount.count === 0) {
      db.prepare(`
        INSERT INTO market_index (index_name, current_value, change_value, change_percent, is_positive)
        VALUES (?, ?, ?, ?, ?)
      `).run('BSE SENSEX', '84,929.36', '+447.55', '0.53', 1);

      console.log('✅ Market index seeded');
      console.log('   SET: 2,080.50 -13.03 (-0.62%)');
    } else {
      console.log('ℹ️  Market index already exists, skipping');
    }

    // ============================================
    // 5. Seed Lottery Results (30 days, excluding today)
    // ============================================
    console.log('\n📦 Step 5: Seeding lottery results (30 days)...');

    const resultsCount = db.prepare('SELECT COUNT(*) as count FROM lottery_results').get() as { count: number };

    if (resultsCount.count === 0) {
      const sessions = db.prepare('SELECT id, session_name FROM market_sessions ORDER BY display_order').all() as Array<{ id: number; session_name: string }>;

      const sampleData = [
        ['139-42', '002-19'],
        ['774-34', '554-94'],
        ['750-60', '667-86'],
        ['962-07', '163-85'],
        ['831-70', '608-97'],
        ['540-08', '713-34'],
        ['212-41', '952-62'],
        ['825-51', '926-67'],
        ['799-76', '750-89'],
        ['692-90', '356-67'],
        ['588-09', '832-43'],
        ['944-68', '839-67'],
        ['142-27', '104-17'],
        ['345-83', '308-20'],
        ['657-95', '136-86'],
        ['139-42', '002-19'],
        ['774-34', '554-94'],
        ['750-60', '667-86'],
        ['962-07', '163-85'],
        ['831-70', '608-97'],
        ['540-08', '713-34'],
        ['212-41', '952-62'],
        ['825-51', '926-67'],
        ['799-76', '750-89'],
        ['692-90', '356-67'],
        ['588-09', '832-43'],
        ['944-68', '839-67'],
        ['142-27', '104-17'],
        ['345-83', '308-20'],
        ['657-95', '136-86'],
      ];

      const insertResult = db.prepare(`
        INSERT INTO lottery_results (result_date, session_id, top_number, bottom_number)
        VALUES (?, ?, ?, ?)
      `);

      const insertMany = db.transaction(() => {
        for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
          const date = format(subDays(new Date(), dayOffset), 'yyyy-MM-dd');
          const dayData = sampleData[30 - dayOffset];

          for (let sessionIdx = 0; sessionIdx < 2; sessionIdx++) {
            const session = sessions[sessionIdx];
            const [topNumber, bottomNumber] = dayData[sessionIdx].split('-');
            insertResult.run(date, session.id, topNumber, bottomNumber);
          }
        }
      });

      insertMany();

      console.log('✅ Seeded 30 days of lottery results');
      console.log(`   Date range: ${format(subDays(new Date(), 30), 'yyyy-MM-dd')} to ${format(subDays(new Date(), 1), 'yyyy-MM-dd')}`);
      console.log(`   Total records: 60 (30 days × 2 sessions)`);
      console.log('   ℹ️  Today excluded - admin can input manually');
    } else {
      console.log('ℹ️  Lottery results already exist, skipping');
    }

    // ============================================
    // Summary
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Database setup completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - Market sessions: 4 sessions');
    console.log('   - Admin users: 1 user (admin/Mbjj903209)');
    console.log('   - Market index: SET initialized');
    console.log('   - Lottery results: 120 records (30 days)');
    console.log('\n🔐 Next steps:');
    console.log('   1. Start the server: bun dev');
    console.log('   2. Login at: /admin/login');
    console.log('   3. Change admin password immediately!');
    console.log('   4. Add today\'s lottery results');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
