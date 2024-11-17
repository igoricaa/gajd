import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AUTH_ERROR_MESSAGES = {
  RATE_LIMIT: 'Too many requests',
  INVALID_FIELDS: 'Invalid or missing fields',
  EMPTY_EMAIL_PASSWORD_FIELDS: 'Please enter your email and password',
  EMPTY_USERNAME_EMAIL_PASSWORD_FIELDS:
    'Please enter your username, email and password',
  INVALID_EMAIL: 'Please enter a valid email address',
  EMAIL_IN_USE: 'Email already in use',
  INVALID_USERNAME: 'Invalid username',
  ACCOUNT_NOT_FOUND: 'Account does not exist',
  INVALID_PASSWORD: 'Invalid password',
  WEAK_PASSWORD: 'Weak password',
} as const;
