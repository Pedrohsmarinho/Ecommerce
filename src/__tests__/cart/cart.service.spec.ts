import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../../cart/cart.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AddToCartDto, UpdateCartItemDto } from '../../dtos/cart.dto';

describe('CartService', () => {
  let service: CartService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    cart: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add a new item to cart', async () => {
      const clientId = '1';
      const addToCartDto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      const mockCartItem = {
        id: '1',
        clientId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
        product: mockProduct,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValue(null);
      mockPrismaService.cart.create.mockResolvedValue(mockCartItem);

      const result = await service.addToCart(clientId, addToCartDto);

      expect(result).toEqual(mockCartItem);
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: {
          clientId,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
        },
        include: {
          product: true,
        },
      });
    });

    it('should update quantity if item already exists in cart', async () => {
      const clientId = '1';
      const addToCartDto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      const existingCartItem = {
        id: '1',
        clientId,
        productId: addToCartDto.productId,
        quantity: 3,
      };

      const updatedCartItem = {
        ...existingCartItem,
        quantity: 5,
        product: mockProduct,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValue(existingCartItem);
      mockPrismaService.cart.update.mockResolvedValue(updatedCartItem);

      const result = await service.addToCart(clientId, addToCartDto);

      expect(result).toEqual(updatedCartItem);
      expect(mockPrismaService.cart.update).toHaveBeenCalledWith({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: 5,
        },
        include: {
          product: true,
        },
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      const clientId = '1';
      const addToCartDto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.addToCart(clientId, addToCartDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const clientId = '1';
      const addToCartDto: AddToCartDto = {
        productId: '1',
        quantity: 20,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.addToCart(clientId, addToCartDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const clientId = '1';
      const cartItemId = '1';
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 3,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      const mockCartItem = {
        id: cartItemId,
        clientId,
        productId: '1',
        quantity: 2,
        product: mockProduct,
      };

      const updatedCartItem = {
        ...mockCartItem,
        quantity: updateCartItemDto.quantity,
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCartItem);
      mockPrismaService.cart.update.mockResolvedValue(updatedCartItem);

      const result = await service.updateCartItem(clientId, cartItemId, updateCartItemDto);

      expect(result).toEqual(updatedCartItem);
      expect(mockPrismaService.cart.update).toHaveBeenCalledWith({
        where: {
          id: cartItemId,
        },
        data: {
          quantity: updateCartItemDto.quantity,
        },
        include: {
          product: true,
        },
      });
    });

    it('should throw NotFoundException when cart item is not found', async () => {
      const clientId = '1';
      const cartItemId = '1';
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 3,
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(null);

      await expect(service.updateCartItem(clientId, cartItemId, updateCartItemDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const clientId = '1';
      const cartItemId = '1';
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 20,
      };

      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      };

      const mockCartItem = {
        id: cartItemId,
        clientId,
        productId: '1',
        quantity: 2,
        product: mockProduct,
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCartItem);

      await expect(service.updateCartItem(clientId, cartItemId, updateCartItemDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const clientId = '1';
      const cartItemId = '1';

      const mockCartItem = {
        id: cartItemId,
        clientId,
        productId: '1',
        quantity: 2,
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCartItem);
      mockPrismaService.cart.delete.mockResolvedValue(mockCartItem);

      const result = await service.removeFromCart(clientId, cartItemId);

      expect(result).toEqual(mockCartItem);
      expect(mockPrismaService.cart.delete).toHaveBeenCalledWith({
        where: {
          id: cartItemId,
        },
      });
    });

    it('should throw NotFoundException when cart item is not found', async () => {
      const clientId = '1';
      const cartItemId = '1';

      mockPrismaService.cart.findFirst.mockResolvedValue(null);

      await expect(service.removeFromCart(clientId, cartItemId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCart', () => {
    it('should return all items in cart', async () => {
      const clientId = '1';

      const mockCartItems = [
        {
          id: '1',
          clientId,
          productId: '1',
          quantity: 2,
          product: {
            id: '1',
            name: 'Test Product',
            price: 99.99,
          },
        },
      ];

      mockPrismaService.cart.findMany.mockResolvedValue(mockCartItems);

      const result = await service.getCart(clientId);

      expect(result).toEqual(mockCartItems);
      expect(mockPrismaService.cart.findMany).toHaveBeenCalledWith({
        where: {
          clientId,
        },
        include: {
          product: true,
        },
      });
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      const clientId = '1';

      mockPrismaService.cart.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.clearCart(clientId);

      expect(result).toEqual({ count: 2 });
      expect(mockPrismaService.cart.deleteMany).toHaveBeenCalledWith({
        where: {
          clientId,
        },
      });
    });
  });

  describe('getCartTotal', () => {
    it('should calculate total cart value', async () => {
      const clientId = '1';

      const mockCartItems = [
        {
          id: '1',
          clientId,
          productId: '1',
          quantity: 2,
          product: {
            id: '1',
            name: 'Test Product 1',
            price: 99.99,
          },
        },
        {
          id: '2',
          clientId,
          productId: '2',
          quantity: 1,
          product: {
            id: '2',
            name: 'Test Product 2',
            price: 149.99,
          },
        },
      ];

      mockPrismaService.cart.findMany.mockResolvedValue(mockCartItems);

      const result = await service.getCartTotal(clientId);

      expect(result).toBe(349.97); // (99.99 * 2) + (149.99 * 1)
      expect(mockPrismaService.cart.findMany).toHaveBeenCalledWith({
        where: {
          clientId,
        },
        include: {
          product: true,
        },
      });
    });
  });
});