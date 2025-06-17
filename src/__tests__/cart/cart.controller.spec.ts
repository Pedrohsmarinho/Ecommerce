import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from '../../cart/cart.controller';
import { CartService } from '../../cart/cart.service';
import { AddToCartDto } from '../../dtos/cart.dto';
import { UpdateCartItemDto } from '../../dtos/cart.dto';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  const mockCartService = {
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
    getCart: jest.fn(),
    clearCart: jest.fn(),
    getCartTotal: jest.fn(),
  };

  const mockRequest = {
    user: {
      clientId: '1'
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const addToCartDto: AddToCartDto = {
        productId: '1',
        quantity: 2,
      };

      const mockCartItem = {
        id: '1',
        userId: mockRequest.user.clientId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCartService.addToCart.mockResolvedValue(mockCartItem);

      const result = await controller.addToCart(mockRequest, addToCartDto);

      expect(result).toEqual(mockCartItem);
      expect(cartService.addToCart).toHaveBeenCalledWith(mockRequest.user.clientId, addToCartDto);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const cartItemId = '1';
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 3,
      };

      const mockCartItem = {
        id: cartItemId,
        userId: mockRequest.user.clientId,
        productId: '1',
        quantity: updateCartItemDto.quantity,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCartService.updateCartItem.mockResolvedValue(mockCartItem);

      const result = await controller.updateCartItem(mockRequest, cartItemId, updateCartItemDto);

      expect(result).toEqual(mockCartItem);
      expect(cartService.updateCartItem).toHaveBeenCalledWith(mockRequest.user.clientId, cartItemId, updateCartItemDto);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const cartItemId = '1';
      const mockResponse = { message: 'Item removed from cart' };

      mockCartService.removeFromCart.mockResolvedValue(mockResponse);

      const result = await controller.removeFromCart(mockRequest, cartItemId);

      expect(result).toEqual(mockResponse);
      expect(cartService.removeFromCart).toHaveBeenCalledWith(mockRequest.user.clientId, cartItemId);
    });
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const mockCart = [
        {
          id: '1',
          userId: mockRequest.user.clientId,
          productId: '1',
          quantity: 2,
          product: {
            id: '1',
            name: 'Test Product',
            price: 99.99,
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockCartService.getCart.mockResolvedValue(mockCart);

      const result = await controller.getCart(mockRequest);

      expect(result).toEqual(mockCart);
      expect(cartService.getCart).toHaveBeenCalledWith(mockRequest.user.clientId);
    });
  });

  describe('clearCart', () => {
    it('should clear user cart', async () => {
      const mockResponse = { message: 'Cart cleared successfully' };

      mockCartService.clearCart.mockResolvedValue(mockResponse);

      const result = await controller.clearCart(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(cartService.clearCart).toHaveBeenCalledWith(mockRequest.user.clientId);
    });
  });

  describe('getCartTotal', () => {
    it('should return cart total', async () => {
      const mockTotal = { total: 199.98 };

      mockCartService.getCartTotal.mockResolvedValue(mockTotal);

      const result = await controller.getCartTotal(mockRequest);

      expect(result).toEqual(mockTotal);
      expect(cartService.getCartTotal).toHaveBeenCalledWith(mockRequest.user.clientId);
    });
  });
});