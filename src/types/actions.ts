import { AppError } from '@/lib/errors';

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: AppError;
  data?: unknown;
} 