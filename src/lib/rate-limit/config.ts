import {
  ExpiringTokenBucket,
  RefillingTokenBucket,
  Throttler,
} from './rate-limit';

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(
  3,
  60 * 10
);

export const passwordUpdateBucket = new ExpiringTokenBucket<string>(5, 60 * 30);
export const globalBucket = new RefillingTokenBucket<string>(100, 1);
export const throttler = new Throttler<number>([
  1, 2, 4, 8, 16, 30, 60, 180, 300,
]);
export const ipBucket = new RefillingTokenBucket<string>(20, 1);
export const signUpIpBucket = new RefillingTokenBucket<string>(3, 10);
