export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const appErrors = {
  UNEXPECTED_ERROR: new AppError('An unexpected error occurred'),
  VALIDATION_ERROR: new AppError('Validation error'),
  NOT_FOUND: new AppError('Resource not found'),
  UNAUTHORIZED: new AppError('Unauthorized'),
  FORBIDDEN: new AppError('Forbidden'),
} as const; 