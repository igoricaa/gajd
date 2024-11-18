'use server';

import { headers } from 'next/headers';
import { globalBucket } from './config';
import { AUTH_ERROR_MESSAGES } from '../constants';
import { NextResponse } from 'next/server';

export async function globalGETRateLimit(): Promise<boolean> {
  const headersList = await headers();
  const clientIP =
    headersList.get('X-Forwarded-For') ||
    headersList.get('X-Real-IP') ||
    headersList.get('Remote-Addr') ||
    null;

  if (clientIP === null) {
    return true;
  }

  return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const headersList = await headers();
  const clientIP =
    headersList.get('X-Forwarded-For') ||
    headersList.get('X-Real-IP') ||
    headersList.get('Remote-Addr') ||
    null;

  if (clientIP === null) {
    return true;
  }

  return globalBucket.consume(clientIP, 3);
}

export async function checkRateLimits(
  method: 'GET' | 'POST'
): Promise<NextResponse | null> {
  if (method === 'POST' && !(await globalPOSTRateLimit())) {
    return NextResponse.json(
      { error: AUTH_ERROR_MESSAGES.RATE_LIMIT },
      { status: 429 }
    );
  }
  if (!(await globalGETRateLimit())) {
    return NextResponse.json(
      { error: AUTH_ERROR_MESSAGES.RATE_LIMIT },
      { status: 429 }
    );
  }

  return null;
}
