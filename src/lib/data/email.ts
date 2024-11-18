'use server';

import { db } from '../db';
import { users } from '../db/schema';
import { count, eq } from 'drizzle-orm';

export async function verifyEmailInput(email: string): Promise<boolean> {
  if (!email) return false;

  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  if (!email) return false;

  const result = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const emailCount: number = result[0].count;

  return emailCount === 0;
}
