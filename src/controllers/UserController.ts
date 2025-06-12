import { Request, Response } from 'express';
import { createUserSchema } from '../dtos/CreateUserDTO';
import { createUser } from '../services/UserService';
import { ZodError } from 'zod';

export async function registerUser(req: Request, res: Response) {
  try {
    const parsed = createUserSchema.parse(req.body);
    const user = await createUser(parsed);

    res.status(201).json({ id: user.id, email: user.email });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      res.status(400).json({ 
        error: 'Validation error',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
      return;
    }
    console.error('Error creating user:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create user'
    });
  }
}