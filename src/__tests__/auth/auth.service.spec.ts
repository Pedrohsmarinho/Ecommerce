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

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

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
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
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

      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, refreshToken: mockTokens.refreshToken });

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshToken: mockTokens.refreshToken },
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
        refreshToken,
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, refreshToken: mockTokens.refreshToken });

      const result = await service.refreshToken(userId, refreshToken);

      expect(result).toEqual({
        access_token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: mockTokens.refreshToken },
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const userId = '1';
      const refreshToken = 'invalid-refresh-token';

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        type: UserType.CLIENT,
        created_at: new Date(),
        updated_at: new Date(),
        emailVerified: false,
        emailVerifyToken: null,
        emailVerifyTokenExpires: null,
        refreshToken: 'different-token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should remove refresh token from user', async () => {
      const userId = '1';

      mockPrismaService.user.update.mockResolvedValue({ id: userId, refreshToken: null });

      await service.logout(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: null },
      });
    });
  });

  describe('register', () => {
    it('should create new user and return user data with tokens', async () => {
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

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.client.create.mockResolvedValue({});
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, refreshToken: mockTokens.refreshToken });

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
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshToken: mockTokens.refreshToken },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';
      const type = UserType.CLIENT;

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email });

      await expect(service.register(email, password, name, type)).rejects.toThrow(ConflictException);
    });
  });
});