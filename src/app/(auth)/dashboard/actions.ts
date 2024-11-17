'use server';

import {
  getCurrentSession,
  invalidateSession,
  deleteSessionTokenCookie,
} from '@/lib/auth/session';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function signOut(): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: 'Too many requests',
    };
  }

  const { session } = await getCurrentSession();
  if (!session) {
    return {
      message: 'Unauthorized',
    };
  }

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();

  return redirect('/sign-in');
}
