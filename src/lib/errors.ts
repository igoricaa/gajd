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
  USER_NOT_FOUND: new AppError('User not found'),
  USER_ALREADY_EXISTS: new AppError('User already exists'),
  UPDATE_PROFILE_FAILED: new AppError('Failed to update profile'),
  RESOURCE_ID_REQUIRED: new AppError('Resource ID is required'),
  NAME_REQUIRED: new AppError('Name is required'),
  FAILED_TO_FETCH_SUBSCRIPTION: new AppError('Failed to fetch subscription'),
  FAILED_TO_FETCH_PLANS: new AppError('Failed to fetch plans'),
  FAILED_TO_FETCH_SUBSCRIPTION_HISTORY: new AppError(
    'Failed to fetch subscription history'
  ),
  FAILED_TO_UPDATE_SUBSCRIPTION: new AppError('Failed to update subscription'),
  FAILED_TO_CANCEL_SUBSCRIPTION: new AppError('Failed to cancel subscription'),
} as const;
