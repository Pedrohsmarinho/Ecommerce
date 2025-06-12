import { Request, Response } from 'express';
import { emailVerificationSchema } from '../dtos/EmailVerificationDTO';
import { resendVerificationSchema } from '../dtos/ResendVerificationDTO';
import { verifyEmail, resendVerificationEmail } from '../services/UserService';
import { ZodError } from 'zod';
import prisma from '../config/database';

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

export async function verifyUserEmail(req: Request, res: Response) {
  try {
    const { token } = emailVerificationSchema.parse(req.body);
    const user = await verifyEmail(token);

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
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

    if (err instanceof Error) {
      if (err.message === 'Invalid verification token') {
        res.status(400).json({
          error: 'Verification failed',
          message: 'Invalid verification token',
        });
        return;
      }

      if (err.message === 'Email already verified') {
        res.status(400).json({
          error: 'Verification failed',
          message: 'Email already verified',
        });
        return;
      }
    }

    console.error('Error verifying email:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify email',
    });
  }
}

export async function resendVerification(req: Request, res: Response) {
  try {
    const { email } = resendVerificationSchema.parse(req.body);
    const user = await resendVerificationEmail(email);

    res.status(200).json({
      message: 'Verification email resent successfully',
      verificationToken: user.emailVerifyToken,
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

    if (err instanceof Error) {
      if (err.message === 'User not found') {
        res.status(404).json({
          error: 'Verification failed',
          message: 'User not found',
        });
        return;
      }

      if (err.message === 'Email already verified') {
        res.status(400).json({
          error: 'Verification failed',
          message: 'Email already verified',
        });
        return;
      }
    }

    console.error('Error resending verification email:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to resend verification email',
    });
  }
}