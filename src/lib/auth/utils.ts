'use server';

import { encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';

export async function generateRandomOTP(): Promise<string> {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = encodeBase32UpperCaseNoPadding(bytes);
  return code;
}
