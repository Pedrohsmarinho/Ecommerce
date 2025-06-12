import { z } from 'zod';

export const registerRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  type: z.enum(['ADMIN', 'CLIENT']).default('CLIENT'),
  // Client specific fields
  fullName: z.string().optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => {
  // If type is CLIENT, require client fields
  if (data.type === 'CLIENT') {
    return data.fullName && data.contact && data.address;
  }
  return true;
}, {
  message: 'Client fields are required when type is CLIENT',
  path: ['fullName'], // This will show the error on the fullName field
});

export type RegisterRequestDTO = z.infer<typeof registerRequestSchema>;