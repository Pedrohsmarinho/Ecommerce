import { z } from 'zod';

export const tokenVerificationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type TokenVerificationDTO = z.infer<typeof tokenVerificationSchema>;