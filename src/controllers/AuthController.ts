import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { loginRequestSchema } from '../dtos/LoginRequestDTO';
import { tokenVerificationSchema } from '../dtos/TokenVerificationDTO';
import { registerRequestSchema } from '../dtos/RegisterRequestDTO';
import { authenticate, verifyToken } from '../services/AuthService';
import { createUser } from '../services/UserService';
import { UserType } from '@prisma/client';

export async function loginUser(req: Request, res: Response) {
  try {
    const parsed = loginRequestSchema.parse(req.body);
    const result = await authenticate(parsed);

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Error during login:', err);

    if (err instanceof Error && err.message === 'Invalid email or password') {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate user',
    });
  }
}

export async function verifyUserToken(req: Request, res: Response) {
  try {
    const parsed = tokenVerificationSchema.parse(req.body);
    const decoded = verifyToken(parsed.token);

    res.status(200).json({
      message: 'Token is valid',
      user: {
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type,
      },
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Error during token verification:', err);

    if (err instanceof Error && err.message === 'Invalid or expired token') {
      res.status(401).json({
        error: 'Token verification failed',
        message: 'Invalid or expired token',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify token',
    });
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    const parsed = registerRequestSchema.parse(req.body);

    // Create user with verification token
    const user = await createUser({
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
      type: parsed.type as UserType,
    });

    // Generate authentication token
    const token = await authenticate({
      email: parsed.email,
      password: parsed.password,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        emailVerified: user.emailVerified,
      },
      token: token?.token,
      verificationToken: user.emailVerifyToken, // Include verification token in response
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    if (err instanceof Error && err.message === 'Email already registered') {
      res.status(400).json({
        error: 'Registration failed',
        message: 'Email already registered',
      });
      return;
    }

    console.error('Error during registration:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user',
    });
  }
}