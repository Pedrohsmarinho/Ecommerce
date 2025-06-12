import { z } from 'zod';

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type ResendVerificationDTO = z.infer<typeof resendVerificationSchema>;