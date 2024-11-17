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
