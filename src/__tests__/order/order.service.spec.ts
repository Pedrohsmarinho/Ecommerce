import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../../order/order.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../../dtos/order.dto';
import { PaymentStatus } from '../../dtos/payment.dto';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        clientId: '1',
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      const mockClient = {
        id: '1',
        name: 'Test Client',
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      const mockOrder = {
        id: '1',
        clientId: createOrderDto.clientId,
        status: OrderStatus.RECEIVED,
        total: 199.98,
        items: [
          {
            productId: '1',
            quantity: 2,
            unitPrice: 99.99,
            subtotal: 199.98,
            product: mockProduct,
          },
        ],
        client: {
          id: '1',
          name: 'Test Client',
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          clientId: createOrderDto.clientId,
          status: OrderStatus.RECEIVED,
          total: 199.98,
          items: {
            create: [
              {
                productId: '1',
                quantity: 2,
                unitPrice: 99.99,
                subtotal: 199.98,
              },
            ],
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          client: {
            include: {
              user: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when client is not found', async () => {
      const createOrderDto: CreateOrderDto = {
        clientId: '1',
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when product is not found', async () => {
      const createOrderDto: CreateOrderDto = {
        clientId: '1',
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      const mockClient = {
        id: '1',
        name: 'Test Client',
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const createOrderDto: CreateOrderDto = {
        clientId: '1',
        items: [
          {
            productId: '1',
            quantity: 20,
          },
        ],
      };

      const mockClient = {
        id: '1',
        name: 'Test Client',
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const orderId = '1';
      const newStatus = OrderStatus.IN_PREPARATION;

      const mockOrder = {
        id: orderId,
        status: OrderStatus.RECEIVED,
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      const updatedOrder = {
        ...mockOrder,
        status: newStatus,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus(orderId, newStatus);

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });

    it('should throw NotFoundException when order is not found', async () => {
      const orderId = '1';
      const newStatus = OrderStatus.IN_PREPARATION;

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.updateOrderStatus(orderId, newStatus)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const orderId = '1';
      const newStatus = OrderStatus.DELIVERED;

      const mockOrder = {
        id: orderId,
        status: OrderStatus.RECEIVED,
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.updateOrderStatus(orderId, newStatus)).rejects.toThrow(BadRequestException);
    });

    it('should restore stock when cancelling order', async () => {
      const orderId = '1';
      const newStatus = OrderStatus.CANCELLED;

      const mockOrder = {
        id: orderId,
        status: OrderStatus.RECEIVED,
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      const updatedOrder = {
        ...mockOrder,
        status: newStatus,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus(orderId, newStatus);

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          stock: {
            increment: 2,
          },
        },
      });
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment and update order status', async () => {
      const orderId = '1';
      const paymentStatus = PaymentStatus.CONFIRMED;

      const mockOrder = {
        id: orderId,
        status: OrderStatus.RECEIVED,
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.IN_PREPARATION,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.confirmPayment(orderId, paymentStatus);

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          stock: {
            decrement: 2,
          },
        },
      });
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.IN_PREPARATION },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when order is not found', async () => {
      const orderId = '1';
      const paymentStatus = PaymentStatus.CONFIRMED;

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.confirmPayment(orderId, paymentStatus)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order is not in RECEIVED status', async () => {
      const orderId = '1';
      const paymentStatus = PaymentStatus.CONFIRMED;

      const mockOrder = {
        id: orderId,
        status: OrderStatus.IN_PREPARATION,
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.confirmPayment(orderId, paymentStatus)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const orderId = '1';

      const mockOrder = {
        id: orderId,
        status: OrderStatus.RECEIVED,
        items: [
          {
            productId: '1',
            quantity: 2,
            product: {
              id: '1',
              name: 'Test Product',
            },
          },
        ],
        client: {
          id: '1',
          name: 'Test Client',
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne(orderId);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          client: {
            include: {
              user: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when order is not found', async () => {
      const orderId = '1';

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne(orderId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        {
          id: '1',
          status: OrderStatus.RECEIVED,
          items: [
            {
              productId: '1',
              quantity: 2,
              product: {
                id: '1',
                name: 'Test Product',
              },
            },
          ],
          client: {
            id: '1',
            name: 'Test Client',
            user: {
              id: '1',
              email: 'test@example.com',
            },
          },
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toEqual(mockOrders);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        include: {
          items: {
            include: {
              product: true,
            },
          },
          client: {
            include: {
              user: true,
            },
          },
        },
      });
    });
  });
});