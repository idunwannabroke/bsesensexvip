import db from './lib/db';

console.log('🔄 Updating Market Index to new defaults...');

try {
    const update = db.prepare(`
    UPDATE market_index 
    SET index_name = ?, current_value = ?, change_value = ?, change_percent = ?, is_positive = ?
    WHERE id = 1 OR index_name = 'SET' OR index_name = 'BSE SENSEX'
  `);

    const result = update.run('BSE SENSEX', '84,929.36', '+447.55', '0.53', 1);

    if (result.changes > 0) {
        console.log('✅ Success: Market index updated!');
    } else {
        // If no row matches, insert it
        db.prepare(`
      INSERT INTO market_index (index_name, current_value, change_value, change_percent, is_positive)
      VALUES (?, ?, ?, ?, ?)
    `).run('BSE SENSEX', '84,929.36', '+447.55', '0.53', 1);
        console.log('✅ Success: Market index inserted!');
    }
} catch (error) {
    console.error('❌ Failed to update database:', error);
}
