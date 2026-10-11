import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { env } from '../config/env.js';

const { Pool } = pg;

async function runMigrations(): Promise<void> {
  console.log('⏳ Running database migrations on direct connection...');

  const migrationPool = new Pool({
    connectionString: env.DATABASE_URL_DIRECT,
    max: 1,
  });

  const migrationDb = drizzle(migrationPool);

  try {
    await migrate(migrationDb, { migrationsFolder: './drizzle' });
    console.log('✅ All migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationPool.end();
  }
}

void runMigrations();
