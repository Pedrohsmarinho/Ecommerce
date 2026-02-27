import { User } from '@prisma/client';

/**
 * User Repository Interface
 * Defines data access methods for User entity
 */
export interface IUserRepository {
  findAll(): Promise<Omit<User, 'password' | 'refreshToken'>[]>;
  findById(id: string): Promise<Omit<User, 'password' | 'refreshToken'> | null>;
  findByEmail(email: string): Promise<User | null>;
  findByVerificationToken(token: string): Promise<User | null>;
  create(data: {
    email: string;
    password: string;
    name: string;
    type: User['type'];
    emailVerifyToken?: string;
    emailVerifyTokenExpires?: Date;
  }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  updateVerificationToken(id: string, token: string, expires: Date): Promise<void>;
  verifyEmail(id: string): Promise<void>;
  updateRefreshToken(id: string, token: string | null): Promise<void>;
}
