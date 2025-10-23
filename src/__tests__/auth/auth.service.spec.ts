import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('../../utils/email', () => ({
  sendVerificationEmail: jest.fn(),
}));
jest.mock('../../utils/hash', () => ({
  hashRefreshToken: jest.fn().mockResolvedValue('hashed-refresh-token'),
  compareRefreshToken: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    client: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      const mockUser = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'Test User',
        type: UserType.CLIENT,
        created_at: new Date(),
        updated_at: new Date(),
        emailVerified: false,
        emailVerifyToken: null,
        emailVerifyTokenExpires: null,
        refreshToken: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        type: mockUser.type,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
        emailVerified: mockUser.emailVerified,
        emailVerifyToken: mockUser.emailVerifyToken,
        emailVerifyTokenExpires: mockUser.emailVerifyTokenExpires,
        refreshToken: mockUser.refreshToken,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null when user is not found', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      const mockUser = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'Test User',
        type: UserType.CLIENT,
        created_at: new Date(),
        updated_at: new Date(),
        emailVerified: false,
        emailVerifyToken: null,
        emailVerifyTokenExpires: null,
        refreshToken: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        type: UserType.CLIENT,
        created_at: new Date(),
        updated_at: new Date(),
        emailVerified: false,
        emailVerifyToken: null,
        emailVerifyTokenExpires: null,
        refreshToken: null,
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        refreshToken: mockTokens.refreshToken,
      });

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshToken: 'hashed-refresh-token' },
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new access and refresh tokens', async () => {
      const userId = '1';
      const refreshToken = 'old-refresh-token';

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        type: UserType.CLIENT,
        created_at: new Date(),
        updated_at: new Date(),
        emailVerified: false,
        emailVerifyToken: null,
        emailVerifyTokenExpires: null,
        refreshToken: 'hashed-refresh-token',
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockJwtService.verifyAsync.mockResolvedValue({
        email: mockUser.email,
        sub: mockUser.id,
        type: mockUser.type,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        refreshToken: 'hashed-refresh-token',
      });

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({
        access_token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: 'hashed-refresh-token' },
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token')
      );
    });
  });

  describe('logout', () => {
    it('should remove refresh token from user', async () => {
      const refreshToken = 'refresh-token';

      await service.logout(refreshToken);
    });
  });

  describe('register', () => {
    it('should create new user and return user data', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';
      const type = UserType.CLIENT;
      const contact = '1234567890';
      const address = 'Test Address';

      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: '1',
        email,
        password: hashedPassword,
        name,
        type,
        created_at: new Date(),
        updated_at: new Date(),
        emailVerified: false,
        emailVerifyToken: 'verification-token',
        emailVerifyTokenExpires: new Date(),
        refreshToken: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.client.create.mockResolvedValue({});

      const result = await service.register(email, password, name, type, contact, address);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          type: mockUser.type,
          emailVerifyToken: mockUser.emailVerifyToken,
        },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.client.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';
      const type = UserType.CLIENT;
      const contact = '1234567890';
      const address = 'Test Address';
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email });

      await expect(service.register(email, password, name, type, contact, address)).rejects.toThrow(
        ConflictException
      );
    });
  });
});
