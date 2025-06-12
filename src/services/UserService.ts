import { CreateUserDTO } from '../dtos/CreateUserDTO';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from './EmailService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TOKEN_EXPIRATION_HOURS = 24;

export async function createUser(data: CreateUserDTO) {
  const { name, email, password, type } = data;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) throw new Error('Email already registered');

  const hashedPassword = await hash(password, 10);
  const token = randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + TOKEN_EXPIRATION_HOURS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      type,
      emailVerified: false,
      emailVerifyToken: token,
      emailVerifyTokenExpires: tokenExpires,
    },
  });

  // Send verification email
  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    token: user.emailVerifyToken!,
  });

  return user;
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token
    },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  if (user.emailVerified) {
    throw new Error('Email already verified');
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null
     },
  });
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.emailVerified) {
    throw new Error('Email already verified');
  }

  const token = randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + TOKEN_EXPIRATION_HOURS);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      emailVerifyToken: token,
      emailVerifyTokenExpires: tokenExpires,
    },
  });

  // Send new verification email
  await sendVerificationEmail({
    email: updatedUser.email,
    name: updatedUser.name,
    token: updatedUser.emailVerifyToken!,
  });

  return updatedUser;
}
