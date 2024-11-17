'use server';

import {
  getCurrentSession,
  invalidateSession,
  deleteSessionTokenCookie,
} from '@/lib/auth/session';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { AUTH_ERROR_MESSAGES } from '@/lib/utils';
import { redirect } from 'next/navigation';

export async function signOut(): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { session } = await getCurrentSession();
  if (session === null) {
    return {
      message: AUTH_ERROR_MESSAGES.UNAUTHORIZED,
    };
  }

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();

  return redirect('/sign-in');
}
