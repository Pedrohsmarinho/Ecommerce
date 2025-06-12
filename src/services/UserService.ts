import { CreateUserDTO } from '../dtos/CreateUserDTO';
import { hashPassword } from '../utils/hash';
import prisma from '../../prisma/client';

export async function createUser(data: CreateUserDTO) {
  const { name, email, password, type } = data;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) throw new Error('Email already registered');

  const hashed = await hashPassword(password);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      type,
    },
  });
}
