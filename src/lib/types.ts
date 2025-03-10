import { ResourceCategory } from './db/schema';

export interface ActionResult {
  message: string | null | undefined;
}

export interface EmailVerificationRequest {
  id: string;
  userId: number;
  code: string;
  email: string;
  expiresAt: Date;
}

export type Category = ResourceCategory & {
  subcategories: ResourceCategory[];
};
