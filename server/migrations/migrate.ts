import fs from 'fs';
import path from 'path';
import db from '../src/config/database';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    const migrationsDir = path.join(__dirname, '.');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await db.query(sql);
      console.log(`✅ Completed: ${file}`);
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Closing database connection...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default runMigrations;
