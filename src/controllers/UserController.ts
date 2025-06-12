import { Request, Response } from 'express';
import { createUserSchema } from '../dtos/CreateUserDTO';
import { createUser } from '../services/UserService';
import { ZodError } from 'zod';
import prisma from '../config/database';

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

export async function getUserProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (err: unknown) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user profile'
    });
  }
}