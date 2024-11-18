import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

export const db = drizzle(process.env.DATABASE_URL);
