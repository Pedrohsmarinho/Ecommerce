import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    client: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto = {
      clientId: 'client-1',
      items: [
        {
          productId: 'product-1',
          quantity: 2,
        },
        {
          productId: 'product-2',
          quantity: 1,
        },
      ],
    };

    const mockClient = {
      id: 'client-1',
      fullName: 'Test Client',
    };

    const mockProducts = [
      {
        id: 'product-1',
        name: 'Product 1',
        price: 50.00,
        stock: 10,
      },
      {
        id: 'product-2',
        name: 'Product 2',
        price: 30.00,
        stock: 5,
      },
    ];

    const mockOrder = {
      id: 'order-1',
      clientId: createOrderDto.clientId,
      status: OrderStatus.RECEIVED,
      total: 130.00,
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          unitPrice: 50.00,
          subtotal: 100.00,
          product: mockProducts[0],
        },
        {
          id: 'item-2',
          productId: 'product-2',
          quantity: 1,
          unitPrice: 30.00,
          subtotal: 30.00,
          product: mockProducts[1],
        },
      ],
      client: {
        ...mockClient,
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    };

    it('should successfully create an order', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1]);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockOrder.id);
      expect(result.status).toBe(OrderStatus.RECEIVED);
      expect(result.total).toBe(130.00);
      expect(result.items).toHaveLength(2);
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if client does not exist', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product stock is insufficient', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProducts[0],
        stock: 1, // Less than requested quantity
      });

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
    });
  });
}); 