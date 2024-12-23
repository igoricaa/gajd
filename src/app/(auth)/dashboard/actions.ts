'use server';

import { verifySession } from '@/lib/auth/session';
import { deleteSession } from '@/lib/auth/session';
import { globalPOSTRateLimit } from '@/lib/rate-limit/request';
import { ActionResult } from '@/lib/types';
import { AUTH_ERROR_MESSAGES } from '@/lib/constants';
import { redirect } from 'next/navigation';

export async function signOut(): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      message: AUTH_ERROR_MESSAGES.RATE_LIMIT,
    };
  }

  const { userId } = await verifySession();
  if (!userId) {
    return {
      message: AUTH_ERROR_MESSAGES.UNAUTHORIZED,
    };
  }

  await deleteSession();

  return redirect('/');
}