import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    contact: z.string().min(1, 'Contact is required').optional(),
    address: z.string().min(1, 'Address is required').optional(),
  }),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>['body'];