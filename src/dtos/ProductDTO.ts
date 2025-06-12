import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
    categoryId: z.string().uuid('Invalid category ID'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    price: z.number().positive('Price must be positive').optional(),
    stock: z.number().int().min(0, 'Stock must be non-negative').optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
  }),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>['body'];
export type UpdateProductDTO = z.infer<typeof updateProductSchema>['body'];