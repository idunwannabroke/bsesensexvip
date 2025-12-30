// Database backup script
// Creates timestamped backups of lottery.db with rotation
// Usage: bun run db:backup
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'lottery.db');
const MAX_BACKUPS = 30; // Keep last 30 backups (1 month if daily)

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('✓ Created backup directory');
  }
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
}

function createBackup(): string {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`Database file not found: ${DB_FILE}`);
  }

  const timestamp = getTimestamp();
  const backupFile = path.join(BACKUP_DIR, `lottery_${timestamp}.db`);

  // Copy database file
  fs.copyFileSync(DB_FILE, backupFile);
  
  const stats = fs.statSync(backupFile);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  
  console.log(`✓ Backup created: ${path.basename(backupFile)} (${sizeMB} MB)`);
  return backupFile;
}

function rotateBackups() {
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('lottery_') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time.getTime() - a.time.getTime()); // newest first

  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`✓ Deleted old backup: ${backup.name}`);
    });
  }

  console.log(`✓ Total backups: ${Math.min(backups.length, MAX_BACKUPS)}/${MAX_BACKUPS}`);
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups found.');
    return;
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('lottery_') && f.endsWith('.db'))
    .map(f => {
      const filePath = path.join(BACKUP_DIR, f);
      const stats = fs.statSync(filePath);
      return {
        name: f,
        time: stats.mtime,
        size: (stats.size / 1024 / 1024).toFixed(2)
      };
    })
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  if (backups.length === 0) {
    console.log('No backups found.');
    return;
  }

  console.log('\n=== Available Backups ===\n');
  backups.forEach((backup, i) => {
    console.log(`${i + 1}. ${backup.name}`);
    console.log(`   Date: ${backup.time.toLocaleString()}`);
    console.log(`   Size: ${backup.size} MB\n`);
  });
}

async function main() {
  const command = process.argv[2];

  try {
    if (command === 'list') {
      listBackups();
    } else {
      console.log('=== Database Backup ===\n');
      ensureBackupDir();
      createBackup();
      rotateBackups();
      console.log('\n✓ Backup completed successfully');
    }
  } catch (error) {
    console.error('✗ Backup failed:', error);
    process.exit(1);
  }
}

main();
