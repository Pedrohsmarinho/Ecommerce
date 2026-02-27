import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from './user.repository.interface';

/**
 * User Repository Implementation
 * Handles all database operations for User entity
 * Separates data access logic from business logic
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Omit<User, 'password' | 'refreshToken'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        emailVerified: true,
        emailVerifyToken: true,
        emailVerifyTokenExpires: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findById(id: string): Promise<Omit<User, 'password' | 'refreshToken'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        emailVerified: true,
        emailVerifyToken: true,
        emailVerifyTokenExpires: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyTokenExpires: {
          gt: new Date(),
        },
      },
    });
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    type: User['type'];
    emailVerifyToken?: string;
    emailVerifyTokenExpires?: Date;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateVerificationToken(id: string, token: string, expires: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        emailVerifyToken: token,
        emailVerifyTokenExpires: expires,
      },
    });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExpires: null,
      },
    });
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        refreshToken: token,
      },
    });
  }
}
