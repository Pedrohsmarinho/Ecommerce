import { z } from 'zod';
import { UserType } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    type: z.nativeEnum(UserType),
    // Client fields
    contact: z.string().optional(),
    address: z.string().optional(),
  }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>['body'];