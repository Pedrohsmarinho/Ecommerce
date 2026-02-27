import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { EmailService } from '../notifications/email.service';
import { ClientProvisioningService } from '../client/client-provisioning.service';

describe('AuthService', () => {
  let service: AuthService;

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

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    generateVerificationToken: jest.fn().mockReturnValue('test-token'),
    getTokenExpiration: jest.fn().mockReturnValue(new Date()),
  };

  const mockClientProvisioningService = {
    createClientProfile: jest.fn(),
    shouldCreateClientProfile: jest.fn().mockResolvedValue(true),
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
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ClientProvisioningService,
          useValue: mockClientProvisioningService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockClientProvisioningService.shouldCreateClientProfile.mockResolvedValue(true);
      mockClientProvisioningService.createClientProfile.mockResolvedValue(undefined);

      const result = await service.register(
        registerDto.email,
        registerDto.password,
        registerDto.name,
        registerDto.type,
        registerDto.contact,
        registerDto.address
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.name).toBe(registerDto.name);
      expect(result.user.type).toBe(registerDto.type);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockClientProvisioningService.createClientProfile).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
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
          registerDto.address
        )
      ).rejects.toThrow(ConflictException);
    });
  });
});
