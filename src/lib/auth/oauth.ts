import { GitHub } from 'arctic';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error('GITHUB environment variables are not set');
}

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET,
  null
);
