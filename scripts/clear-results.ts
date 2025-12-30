import db from '../lib/db';

console.log('🧹 Clearing old lottery results...');
db.prepare('DELETE FROM lottery_results').run();
console.log('✅ Cleared!');
process.exit(0);
