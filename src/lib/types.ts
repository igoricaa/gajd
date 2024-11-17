export interface ActionResult {
  message: string;
}

export interface EmailVerificationRequest {
  id: string;
  userId: number;
  code: string;
  email: string;
  expiresAt: Date;
}
