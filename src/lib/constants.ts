export const SESSION_COOKIE_NAME = 'gajd_session';
export const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY
);
export const SESSION_RENEWAL_THRESHOLD = 1000 * 60 * 60 * 24 * 15; // 15 days
export const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days

export const AUTH_ERROR_MESSAGES = {
  RATE_LIMIT: 'Too many requests',
  INVALID_FIELDS: 'Invalid or missing fields',
  EMPTY_EMAIL_FIELD: 'Please enter your email',
  EMPTY_PASSWORD_FIELD: 'Please enter your password',
  EMPTY_EMAIL_PASSWORD_FIELDS: 'Please enter your email and password',
  EMPTY_USERNAME_EMAIL_PASSWORD_FIELDS:
    'Please enter your username, email and password',
  INVALID_EMAIL: 'Please enter a valid email address',
  EMAIL_IN_USE: 'Email already in use',
  INVALID_USERNAME: 'Invalid username',
  ACCOUNT_NOT_FOUND: 'Account does not exist',
  INVALID_PASSWORD: 'Invalid password',
  WEAK_PASSWORD: 'Weak password',
  EMPTY_CODE_FIELD: 'Enter your code',
  INVALID_CODE: 'Invalid code',
  INCORRECT_CODE: 'Incorrect code',
  NOT_AUTHENTICATED: 'Not authenticated',
  FORBIDDEN: 'Forbidden',
  EXPIRED_CODE:
    'The verification code was expired. We sent another code to your inbox.',
  NEW_CODE_SENT: 'A new code was sent to your inbox.',
  INCORRECT_PASSWORD: 'Incorrect password',
  PASSWORD_UPDATED: 'Updated password',
  EMAIL_UPDATED: 'Updated email',
  RESTART_PROCESS: 'Please restart the process',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_KEY: 'Invalid key',
} as const;
