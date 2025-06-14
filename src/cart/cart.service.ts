import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from '../dtos/cart.dto';
import { Cart, Product } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(clientId: string, addToCartDto: AddToCartDto) {
    // Verify product exists and has enough stock
    const product = await this.prisma.product.findUnique({
      where: { id: addToCartDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${addToCartDto.productId} not found`);
    }

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${addToCartDto.quantity}`,
      );
    }

    // Check if item already exists in cart
    const existingCartItem = await this.prisma.cart.findUnique({
      where: {
        clientId_productId: {
          clientId,
          productId: addToCartDto.productId,
        },
      },
    });

    if (existingCartItem) {
      // Update quantity if item exists
      const newQuantity = existingCartItem.quantity + addToCartDto.quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${newQuantity}`,
        );
      }

      return this.prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
        },
      });
    }

    // Create new cart item
    return this.prisma.cart.create({
      data: {
        clientId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async updateCartItem(clientId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto) {
    const cartItem = await this.prisma.cart.findFirst({
      where: {
        id: cartItemId,
        clientId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    if (cartItem.product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${cartItem.product.name}. Available: ${cartItem.product.stock}, Requested: ${updateCartItemDto.quantity}`,
      );
    }

    return this.prisma.cart.update({
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
  }

  async removeFromCart(clientId: string, cartItemId: string) {
    const cartItem = await this.prisma.cart.findFirst({
      where: {
        id: cartItemId,
        clientId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    return this.prisma.cart.delete({
      where: {
        id: cartItemId,
      },
    });
  }

  async getCart(clientId: string) {
    return this.prisma.cart.findMany({
      where: {
        clientId,
      },
      include: {
        product: true,
      },
    });
  }

  async clearCart(clientId: string) {
    return this.prisma.cart.deleteMany({
      where: {
        clientId,
      },
    });
  }

  async getCartTotal(clientId: string) {
    const cartItems = await this.prisma.cart.findMany({
      where: {
        clientId,
      },
      include: {
        product: true,
      },
    });

    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  }
}