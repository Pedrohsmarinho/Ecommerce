import { z } from 'zod';

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type EmailVerificationDTO = z.infer<typeof emailVerificationSchema>;