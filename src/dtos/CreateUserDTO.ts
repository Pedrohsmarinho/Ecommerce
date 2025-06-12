import { z } from 'zod';
import { UserType } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  type: z.enum([UserType.ADMIN, UserType.CLIENT], {
    errorMap: () => ({ message: 'Type must be either ADMIN or CLIENT' }),
  }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;