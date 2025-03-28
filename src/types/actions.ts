import { AppError } from '@/lib/errors';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: AppError;
}
