import 'server-only';

import { cache } from 'react';
import { db } from './db';
import { User, users } from './db/schema';
import { eq } from 'drizzle-orm';
import { verifySession } from './auth/session';

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session.userId) return null;

  try {
    const data = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));

    const user: User = data[0];

    return user;
  } catch (error) {
    console.log('Failed to fetch user');
    return null;
  }
});
