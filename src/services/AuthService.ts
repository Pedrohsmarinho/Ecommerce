// Types embutidos já estão inclusos no jsonwebtoken v9
import jwt, { SignOptions } from 'jsonwebtoken';

import { comparePasswords } from '../utils/hash';
import { LoginRequestDTO } from '../dtos/LoginRequestDTO';
import prisma from '../config/database';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface CustomJwtPayload {
  userId: string;
  email: string;
  type: string;
}

export async function authenticate(data: LoginRequestDTO) {
  const { email, password } = data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const payload: CustomJwtPayload = {
    userId: user.id,
    email: user.email,
    type: user.type,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
    },
  };
}

export function generateToken(payload: CustomJwtPayload): string {
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  );
}

export function verifyToken(token: string): CustomJwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
}