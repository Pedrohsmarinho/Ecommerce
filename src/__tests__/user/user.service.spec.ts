import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserType } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateUserDTO } from '../../user/dto/create-user.dto';
import { UpdateProfileDTO } from '../../user/dto/update-profile.dto';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    client: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          type: UserType.CLIENT,
          emailVerified: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.CLIENT,
        emailVerified: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user and client profile', async () => {
      const createUserDto: CreateUserDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        type: UserType.CLIENT,
        contact: '1234567890',
        address: 'Test Address',
      };

      const mockUser = {
        id: '1',
        email: createUserDto.email,
        name: createUserDto.name,
        type: createUserDto.type,
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.client.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.client.create).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', createUserDto.email);
    });
  });

  describe('updateProfile', () => {
    it('should update user and client profile', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDTO = {
        name: 'Updated Name',
        contact: '9876543210',
        address: 'Updated Address',
      };

      const mockUser = {
        id: userId,
        type: UserType.CLIENT,
        client: {
          id: '1',
          fullName: 'Old Name',
          contact: '1234567890',
          address: 'Old Address',
        },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.update.mockResolvedValue({
        id: '1',
        fullName: updateProfileDto.name,
        contact: updateProfileDto.contact,
        address: updateProfileDto.address,
        user: {
          id: userId,
          email: 'test@example.com',
          name: updateProfileDto.name,
          type: UserType.CLIENT,
          emailVerified: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockPrismaService.client.update).toHaveBeenCalled();
      expect(result).toHaveProperty('fullName', updateProfileDto.name);
    });

    it('should throw ForbiddenException for non-client users', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDTO = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: userId,
        type: UserType.ADMIN,
        client: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email with valid token', async () => {
      const token = 'valid-token';
      const mockUser = {
        id: '1',
        emailVerifyToken: token,
        emailVerifyTokenExpires: new Date(Date.now() + 3600000),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.verifyEmail(token);

      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          emailVerified: true,
          emailVerifyToken: null,
          emailVerifyTokenExpires: null,
        },
      });
    });

    it('should throw NotFoundException with invalid token', async () => {
      const token = 'invalid-token';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow(NotFoundException);
    });
  });
});