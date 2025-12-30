// Database restore script
// Restores lottery.db from a backup file
// Usage: bun run db:restore <backup-filename>
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'lottery.db');

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups directory found.');
    return [];
  }

  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('lottery_') && f.endsWith('.db'))
    .map(f => {
      const filePath = path.join(BACKUP_DIR, f);
      const stats = fs.statSync(filePath);
      return {
        name: f,
        path: filePath,
        time: stats.mtime,
        size: (stats.size / 1024 / 1024).toFixed(2)
      };
    })
    .sort((a, b) => b.time.getTime() - a.time.getTime());
}

async function confirmRestore(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Are you sure you want to restore? This will overwrite current database (y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function restoreBackup(backupName: string) {
  const backupPath = path.join(BACKUP_DIR, backupName);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupName}`);
  }

  // Create a backup of current DB before restore
  if (fs.existsSync(DB_FILE)) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '').replace('T', '_');
    const preRestoreBackup = path.join(BACKUP_DIR, `lottery_pre-restore_${timestamp}.db`);
    fs.copyFileSync(DB_FILE, preRestoreBackup);
    console.log(`✓ Created pre-restore backup: ${path.basename(preRestoreBackup)}`);
  }

  // Restore the backup
  fs.copyFileSync(backupPath, DB_FILE);
  
  const stats = fs.statSync(DB_FILE);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  
  console.log(`✓ Database restored from: ${backupName} (${sizeMB} MB)`);
}

async function main() {
  console.log('=== Database Restore ===\n');

  const backups = listBackups();

  if (backups.length === 0) {
    console.log('No backups found. Run "bun run db:backup" first.');
    process.exit(1);
  }

  // Get backup filename from command line arg
  const backupName = process.argv[2];

  if (!backupName) {
    console.log('Available backups:\n');
    backups.forEach((backup, i) => {
      console.log(`${i + 1}. ${backup.name}`);
      console.log(`   Date: ${backup.time.toLocaleString()}`);
      console.log(`   Size: ${backup.size} MB\n`);
    });
    console.log('Usage: bun run db:restore <backup-filename>');
    console.log('Example: bun run db:restore lottery_2025-11-15_10-30-00.db');
    process.exit(1);
  }

  try {
    console.log(`Restoring: ${backupName}\n`);
    
    const confirmed = await confirmRestore();
    
    if (!confirmed) {
      console.log('Restore cancelled.');
      process.exit(0);
    }

    await restoreBackup(backupName);
    console.log('\n✓ Restore completed successfully');
  } catch (error) {
    console.error('✗ Restore failed:', error);
    process.exit(1);
  }
}

main();
