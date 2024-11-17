'use server';

import { headers } from 'next/headers';
import { globalBucket } from './config';

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
