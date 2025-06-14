import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
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

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      type: UserType.CLIENT,
      contact: '1234567890',
      address: 'Test Address',
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        type: registerDto.type,
        emailVerified: false,
        emailVerifyToken: 'token',
        emailVerifyTokenExpires: new Date(),
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.client.create.mockResolvedValue({});
      mockJwtService.signAsync.mockResolvedValue(mockTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValue(mockTokens.refreshToken);

      const result = await service.register(
        registerDto.email,
        registerDto.password,
        registerDto.name,
        registerDto.type,
        registerDto.contact,
        registerDto.address,
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.name).toBe(registerDto.name);
      expect(result.user.type).toBe(registerDto.type);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.client.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      await expect(
        service.register(
          registerDto.email,
          registerDto.password,
          registerDto.name,
          registerDto.type,
          registerDto.contact,
          registerDto.address,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
}); 