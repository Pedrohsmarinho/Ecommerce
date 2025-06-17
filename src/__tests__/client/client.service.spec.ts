import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from '../../client/client.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateClientDto, UpdateClientDto, FilterClientDto } from '../../dtos/client.dto';
import { UserType } from '@prisma/client';

describe('ClientService', () => {
  let service: ClientService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    client: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createClientDto: CreateClientDto = {
        userId: '1',
        fullName: 'Test Client',
        contact: '1234567890',
        address: 'Test Address',
      };

      const mockClient = {
        id: '1',
        ...createClientDto,
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          type: UserType.CLIENT,
        },
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.client.create.mockResolvedValue(mockClient);

      const result = await service.create(createClientDto);

      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: createClientDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const mockClients = [
        {
          id: '1',
          userId: '1',
          fullName: 'Test Client',
          contact: '1234567890',
          address: 'Test Address',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            type: UserType.CLIENT,
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findAll();
      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const mockClient = {
        id: '1',
        userId: '1',
        fullName: 'Test Client',
        contact: '1234567890',
        address: 'Test Address',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          type: UserType.CLIENT,
        },
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      const result = await service.findOne('1');
      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when client is not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateClientDto: UpdateClientDto = {
        fullName: 'Updated Client',
        contact: '9876543210',
        address: 'Updated Address',
      };

      const mockClient = {
        id: '1',
        userId: '1',
        fullName: 'Test Client',
        contact: '1234567890',
        address: 'Test Address',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          type: UserType.CLIENT,
        },
      };

      const updatedClient = {
        ...mockClient,
        ...updateClientDto,
      };

      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.update('1', updateClientDto);

      expect(result).toEqual(updatedClient);
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateClientDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when client is not found', async () => {
      const updateClientDto: UpdateClientDto = {
        fullName: 'Updated Client',
      };

      mockPrismaService.client.update.mockRejectedValue(new Error());

      await expect(service.update('1', updateClientDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a client', async () => {
      const mockClient = {
        id: '1',
        userId: '1',
        fullName: 'Test Client',
      };

      mockPrismaService.client.delete.mockResolvedValue(mockClient);

      const result = await service.remove('1');

      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when client is not found', async () => {
      mockPrismaService.client.delete.mockRejectedValue(new Error());

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findWithFilters', () => {
    it('should filter clients by name', async () => {
      const filters: FilterClientDto = {
        name: 'Test',
      };

      const mockClients = [
        {
          id: '1',
          userId: '1',
          fullName: 'Test Client',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            type: UserType.CLIENT,
          },
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findWithFilters(filters);

      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: {
          user: {
            name: {
              contains: filters.name,
              mode: 'insensitive',
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    });

    it('should filter clients by email', async () => {
      const filters: FilterClientDto = {
        email: 'test@example.com',
      };

      const mockClients = [
        {
          id: '1',
          userId: '1',
          fullName: 'Test Client',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            type: UserType.CLIENT,
          },
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findWithFilters(filters);

      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: {
          user: {
            email: {
              contains: filters.email,
              mode: 'insensitive',
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    });

    it('should filter clients by status', async () => {
      const filters: FilterClientDto = {
        status: true,
      };

      const mockClients = [
        {
          id: '1',
          userId: '1',
          fullName: 'Test Client',
          status: true,
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            type: UserType.CLIENT,
          },
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findWithFilters(filters);

      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: {
          status: filters.status,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
        },
      });
    });
  });
});