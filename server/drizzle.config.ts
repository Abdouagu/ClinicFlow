import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

const databaseUrlDirect = process.env['DATABASE_URL_DIRECT'];

if (!databaseUrlDirect) {
  throw new Error('DATABASE_URL_DIRECT is required in environment for drizzle-kit migrations');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrlDirect,
  },
  strict: true,
  verbose: true,
});
